import mongoose from 'mongoose';
import QRCode from 'qrcode';
import { Product } from '../models/Product.js';
import { ProductCategory } from '../models/ProductCategory.js';
import { InventoryMovement } from '../models/InventoryMovement.js';
import { SerialNumber } from '../models/SerialNumber.js';
import { StockReservation } from '../models/StockReservation.js';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { Warranty } from '../models/Warranty.js';
import { getSettings } from '../models/Setting.js';
import { ApiError } from '../utils/apiError.js';
import { paginate, searchFilter, escapeRegex } from '../utils/query.js';
import { nextNumber } from '../utils/sequence.js';
import { writeAudit } from './audit.service.js';

export async function listProducts({ q, category, kind, lowStock, page, limit }) {
  const { skip, limit: l, page: p } = paginate({ page, limit });
  const filter = { ...searchFilter(q, ['name', 'sku', 'brand', 'model']) };
  if (category) filter.category = category;
  if (kind) filter.kind = kind;
  const [items, total] = await Promise.all([
    Product.find(filter).populate('category').sort({ name: 1 }).skip(skip).limit(l),
    Product.countDocuments(filter),
  ]);
  const mapped = items.map((p) => {
    const obj = p.toObject({ virtuals: true });
    obj.isLowStock = obj.availableQuantity <= obj.minStockLevel;
    return obj;
  });
  const result = lowStock === 'true' ? mapped.filter((p) => p.isLowStock) : mapped;
  return { items: result, meta: { page: p, limit: l, total } };
}

export async function getProduct(id) {
  const product = await Product.findById(id).populate('category');
  if (!product) throw new ApiError(404, 'Product not found');
  return product.toObject({ virtuals: true });
}

export async function createProduct(actor, payload) {
  const exists = await Product.findOne({ sku: payload.sku.toUpperCase() });
  if (exists) throw new ApiError(409, 'SKU already exists');
  const product = await Product.create({
    ...payload,
    sku: payload.sku.toUpperCase(),
    requiresSerialNumber: payload.requiresSerialNumber === true || payload.requiresSerialNumber === 'true',
  });
  await writeAudit({ actor: actor._id, action: 'product.create', entityType: 'Product', entityId: product._id });
  return product;
}

export async function updateProduct(actor, id, payload) {
  const product = await Product.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
}

export async function listCategories() {
  return ProductCategory.find().sort({ name: 1 });
}

export async function createCategory(payload) {
  const slug = (payload.slug || payload.name).toLowerCase().replace(/\s+/g, '-');
  const exists = await ProductCategory.findOne({ $or: [{ name: payload.name }, { slug }] });
  if (exists) throw new ApiError(409, 'Category already exists');
  return ProductCategory.create({ name: payload.name, slug, description: payload.description });
}

export async function receiveStock(actor, { productId, quantity, serials, notes }) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const product = await Product.findById(productId).session(session);
    if (!product) throw new ApiError(404, 'Product not found');
    const qty = Number(quantity);
    if (qty < 1) throw new ApiError(400, 'Quantity must be at least 1');

    if (product.requiresSerialNumber) {
      const list = (serials || []).map((s) => String(s).trim()).filter(Boolean);
      if (list.length !== qty) {
        throw new ApiError(400, 'Provide one unique serial number for each received unit');
      }
      const unique = new Set(list.map((s) => s.toUpperCase()));
      if (unique.size !== list.length) throw new ApiError(400, 'Duplicate serials in this receipt');
      const existing = await SerialNumber.find({ serial: { $in: list } }).session(session);
      if (existing.length) throw new ApiError(409, 'One or more serial numbers already exist');
      for (const serial of list) {
        const qrPayload = JSON.stringify({ serial, sku: product.sku });
        const qrImageDataUrl = await QRCode.toDataURL(serial, { margin: 1, width: 256 });
        await SerialNumber.create(
          [{ serial, product: product._id, qrPayload, qrImageDataUrl, status: 'in_stock' }],
          { session }
        );
      }
    }

    product.quantityOnHand += qty;
    await product.save({ session });
    await InventoryMovement.create(
      [
        {
          product: product._id,
          type: 'received',
          quantity: qty,
          notes,
          serialNumbers: serials || [],
          createdBy: actor._id,
        },
      ],
      { session }
    );
    await session.commitTransaction();
    return getProduct(product._id);
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

async function assertPaymentGate(order) {
  const settings = await getSettings();
  const paid = await Payment.aggregate([
    { $match: { order: order._id } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const received = paid[0]?.total || 0;
  const required = (order.orderAmount * settings.minAdvancePercentBeforeDispatch) / 100;
  if (received + 0.001 < required) {
    throw new ApiError(
      400,
      `Dispatch requires at least ${settings.minAdvancePercentBeforeDispatch}% payment. Received ₹${received.toFixed(2)} of ₹${order.orderAmount.toFixed(2)}.`
    );
  }
}

export async function reserveOrder(actor, orderId) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(orderId).populate('quotation').session(session);
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.inventoryStatus === 'reserved' || order.inventoryStatus === 'dispatched') {
      throw new ApiError(400, 'Stock is already reserved or dispatched for this order');
    }
    const quotation = order.quotation;
    for (const item of quotation.items) {
      if (!item.product || item.quantity <= 0) continue;
      const product = await Product.findById(item.product).session(session);
      if (!product) throw new ApiError(400, `Product missing for BOM item ${item.name}`);
      const available = product.quantityOnHand - product.quantityReserved;
      if (available < item.quantity) {
        throw new ApiError(
          400,
          `Insufficient stock for ${product.name}. Available ${available}, required ${item.quantity}.`
        );
      }
      product.quantityReserved += item.quantity;
      await product.save({ session });
      await StockReservation.create(
        [{ order: order._id, product: product._id, quantity: item.quantity, status: 'active' }],
        { session }
      );
      await InventoryMovement.create(
        [
          {
            product: product._id,
            type: 'reserved',
            quantity: item.quantity,
            referenceType: 'Order',
            referenceId: order._id,
            createdBy: actor._id,
          },
        ],
        { session }
      );
    }
    order.inventoryStatus = 'reserved';
    await order.save({ session });
    await session.commitTransaction();
    await writeAudit({ actor: actor._id, action: 'inventory.reserve', entityType: 'Order', entityId: order._id });
    return order;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

export async function dispatchOrder(actor, orderId, serialAssignments = []) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(orderId).populate('quotation').session(session);
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.inventoryStatus !== 'reserved') throw new ApiError(400, 'Reserve stock before dispatch');
    await assertPaymentGate(order);

    const quotation = order.quotation;
    const assignmentByProduct = {};
    for (const row of serialAssignments) {
      assignmentByProduct[String(row.productId)] = (row.serials || []).map((s) => s.trim());
    }

    for (const item of quotation.items) {
      if (!item.product || item.quantity <= 0) continue;
      const product = await Product.findById(item.product).session(session);
      if (product.requiresSerialNumber) {
        const serials = assignmentByProduct[String(product._id)] || [];
        if (serials.length !== item.quantity) {
          throw new ApiError(400, `Provide ${item.quantity} serial number(s) for ${product.name}`);
        }
        const docs = await SerialNumber.find({ serial: { $in: serials }, product: product._id }).session(session);
        if (docs.length !== serials.length) throw new ApiError(400, `Invalid serials for ${product.name}`);
        for (const sn of docs) {
          if (sn.status !== 'in_stock' && sn.status !== 'reserved') {
            throw new ApiError(400, `Serial ${sn.serial} is not available for dispatch`);
          }
          sn.status = 'dispatched';
          sn.order = order._id;
          sn.customer = order.customer;
          sn.dispatchedAt = new Date();
          await sn.save({ session });
          const start = product.warrantyActivationMilestone === 'dispatch' ? new Date() : null;
          const expiry = start
            ? new Date(start.getTime() + product.warrantyDurationMonths * 30 * 86400000)
            : null;
          await Warranty.create(
            [
              {
                customer: order.customer,
                order: order._id,
                product: product._id,
                serialNumber: sn._id,
                serial: sn.serial,
                durationMonths: product.warrantyDurationMonths,
                activationMilestone: product.warrantyActivationMilestone,
                startDate: start,
                expiryDate: expiry,
                status: start ? 'active' : 'pending',
                certificateNumber: start ? await nextNumber('WR') : undefined,
                history: [
                  {
                    status: start ? 'active' : 'pending',
                    note: start ? 'Activated on dispatch' : 'Pending installation',
                    by: actor._id,
                  },
                ],
              },
            ],
            { session }
          );
        }
      } else {
        await Warranty.create(
          [
            {
              customer: order.customer,
              order: order._id,
              product: product._id,
              durationMonths: product.warrantyDurationMonths,
              activationMilestone: product.warrantyActivationMilestone,
              status: 'pending',
              history: [{ status: 'pending', note: 'Awaiting activation milestone', by: actor._id }],
            },
          ],
          { session }
        );
      }

      product.quantityReserved = Math.max(0, product.quantityReserved - item.quantity);
      product.quantityOnHand = Math.max(0, product.quantityOnHand - item.quantity);
      await product.save({ session });
      await StockReservation.updateMany(
        { order: order._id, product: product._id, status: 'active' },
        { status: 'dispatched' },
        { session }
      );
      await InventoryMovement.create(
        [
          {
            product: product._id,
            type: 'dispatched',
            quantity: item.quantity,
            referenceType: 'Order',
            referenceId: order._id,
            serialNumbers: assignmentByProduct[String(product._id)] || [],
            createdBy: actor._id,
          },
        ],
        { session }
      );
    }

    order.inventoryStatus = 'dispatched';
    await order.save({ session });
    await session.commitTransaction();
    await writeAudit({ actor: actor._id, action: 'inventory.dispatch', entityType: 'Order', entityId: order._id });
    return order;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

export async function listSerials({ q, status, product, page, limit }) {
  const { skip, limit: l, page: p } = paginate({ page, limit });
  const filter = {};
  if (status) filter.status = status;
  if (product) filter.product = product;
  if (q) filter.serial = new RegExp(escapeRegex(q), 'i');
  const [items, total] = await Promise.all([
    SerialNumber.find(filter)
      .populate('product', 'name sku kind')
      .populate('customer', 'fullName phone')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l),
    SerialNumber.countDocuments(filter),
  ]);
  return { items, meta: { page: p, limit: l, total } };
}

export async function lookupSerial(serial) {
  const doc = await SerialNumber.findOne({ serial: serial.trim() })
    .populate('product')
    .populate('customer')
    .populate('order');
  if (!doc) throw new ApiError(404, 'Serial number not found');
  const warranty = await Warranty.findOne({ serial: doc.serial }).populate('product customer order');
  return { serial: doc, warranty };
}

export async function listMovements({ product, page, limit }) {
  const { skip, limit: l, page: p } = paginate({ page, limit });
  const filter = {};
  if (product) filter.product = product;
  const [items, total] = await Promise.all([
    InventoryMovement.find(filter)
      .populate('product', 'name sku')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l),
    InventoryMovement.countDocuments(filter),
  ]);
  return { items, meta: { page: p, limit: l, total } };
}

export async function lowStock() {
  const products = await Product.find({ isActive: true });
  return products
    .map((p) => p.toObject({ virtuals: true }))
    .filter((p) => p.availableQuantity <= p.minStockLevel);
}

export async function deleteProduct(actor, id) {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, 'Product not found');
  if (product.quantityReserved > 0) {
    throw new ApiError(400, 'Cannot delete a product with reserved stock');
  }
  await SerialNumber.deleteMany({ product: id, status: 'in_stock' });
  await Product.findByIdAndDelete(id);
  await writeAudit({ actor: actor._id, action: 'product.delete', entityType: 'Product', entityId: id });
}

export async function deleteSerial(actor, id) {
  const sn = await SerialNumber.findById(id);
  if (!sn) throw new ApiError(404, 'Serial number not found');
  if (sn.status !== 'in_stock') {
    throw new ApiError(400, 'Only in-stock serial numbers can be deleted');
  }
  await SerialNumber.findByIdAndDelete(id);
  await Product.findByIdAndUpdate(sn.product, { $inc: { quantityOnHand: -1 } });
  await writeAudit({ actor: actor._id, action: 'serial.delete', entityType: 'SerialNumber', entityId: id });
}
