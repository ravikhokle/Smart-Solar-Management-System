import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import api, { toast } from '../../services/api.js';
import { useApi } from '../../hooks/useApi.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Badge, { statusTone } from '../../components/common/Badge.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import RowActions from '../../components/common/RowActions.jsx';

export default function SerialsPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [lookup, setLookup] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const { data, meta, loading, reload } = useApi(() => api.get('/inventory/serials', { params: { q, page } }), [q, page]);
  const deleteSerial = async () => {
    try {
      await api.delete(`/inventory/serials/${deleteTarget._id}`);
      toast('success', 'Serial number deleted successfully');
      setDeleteTarget(null);
      reload();
    } catch (err) {
      // api interceptor displays the backend error
    }
  };

  const find = async (serial) => {
    const value = String(serial || '').trim();
    if (!value) throw new Error('The QR code is empty');
    const res = await api.get(`/inventory/serials/lookup/${encodeURIComponent(value)}`);
    setLookup(res.data.data);
    setQ(value);
    toast('success', 'Serial verified');
  };

  const stopScan = async () => {
    if (!scannerRef.current) return;
    try {
      await scannerRef.current.stop();
    } catch {
      // The scanner may already be stopped after a successful decode.
    } finally {
      scannerRef.current.clear();
    }
    scannerRef.current = null;
    setScanning(false);
  };

  const scan = async () => {
    if (scanning) return;
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;
    setScanning(true);
    try {
      const cameras = await Html5Qrcode.getCameras();
      const camera = cameras.find((item) => /back|rear|environment/i.test(item.label)) || cameras[0];
      if (!camera) throw new Error('No camera was found');
      await scanner.start(
        camera.id,
        {
          fps: 15,
          qrbox: { width: 280, height: 280 },
          aspectRatio: 1,
          disableFlip: true,
        },
        async (text) => {
          await stopScan();
          try {
            await find(text);
          } catch {
            toast('error', `Serial "${text}" was not found`);
          }
        },
        () => {}
      );
    } catch (error) {
      scannerRef.current = null;
      setScanning(false);
      toast('error', error.message || 'Unable to start the camera');
    }
  };

  const scanImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const scanner = new Html5Qrcode('qr-file-reader');
    try {
      const text = await scanner.scanFile(file, true);
      await find(text);
    } catch (error) {
      toast('error', error.message || 'Could not read the QR image');
    } finally {
      scanner.clear();
    }
  };

  return (
    <div>
      <PageHeader title="Serial numbers" subtitle="Generate QR codes on receipt. Scan before dispatch." />
      <div className="mb-4 flex flex-wrap gap-2">
        <input className="input max-w-xs" placeholder="Search serial" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn-secondary" onClick={() => q && find(q)}>Verify</button>
        <button className="btn-secondary" onClick={scanning ? stopScan : scan}>
          {scanning ? 'Stop camera' : 'Scan camera'}
        </button>
        <label className="btn-secondary cursor-pointer">
          Upload QR image
          <input className="hidden" type="file" accept="image/*" onChange={scanImage} />
        </label>
      </div>
      <div className="mb-4 max-w-sm">
        <div id="qr-reader" />
        <div id="qr-file-reader" className="hidden" />
      </div>
      {lookup && (
        <div className="card mb-4 p-4 text-sm">
          <div>Serial {lookup.serial.serial} · {lookup.serial.status}</div>
          <div>Product {lookup.serial.product?.name}</div>
          <div>Customer {lookup.serial.customer?.fullName || '—'}</div>
          <div>Warranty {lookup.warranty?.status || 'none'} {lookup.warranty?._id && <Link className="text-solar-orange" to={`/warranties/${lookup.warranty._id}`}>open</Link>}</div>
          {lookup.serial.qrImageDataUrl && <img src={lookup.serial.qrImageDataUrl} alt="QR" className="mt-2 h-32" />}
        </div>
      )}
      <DataTable
        loading={loading}
        rows={data || []}
        page={page}
        total={meta?.total}
        limit={meta?.limit}
        onPage={setPage}
        emptyTitle="No serial numbers yet."
        emptyDescription="Receive serial-tracked stock to generate QR codes."
        columns={[
          { key: 'serial', header: 'Serial' },
          { key: 'product', header: 'Product', render: (r) => r.product?.name },
          { key: 'status', header: 'Status', render: (r) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
          { key: 'qr', header: 'QR', render: (r) => r.qrImageDataUrl ? <img src={r.qrImageDataUrl} alt={`QR for ${r.serial}`} className="h-20 w-20" /> : '—' },
          {
            key: 'actions',
            header: 'Actions',
            render: (r) => <RowActions onDelete={() => setDeleteTarget(r)} />,
          },
        ]}
      />
      {deleteTarget && (
        <ConfirmDialog
          title="Delete serial number?"
          message={`${deleteTarget.serial} will be permanently deleted. Only in-stock serial numbers can be deleted.`}
          confirmLabel="Delete serial"
          danger
          onClose={() => setDeleteTarget(null)}
          onConfirm={deleteSerial}
        />
      )}
    </div>
  );
}
