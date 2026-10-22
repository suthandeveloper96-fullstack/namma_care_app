import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FileText, ShieldCheck, Trash2, Upload } from 'lucide-react';
import Alert from '../ui/Alert';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { submitPrescription } from '../../features/cart/cartThunks';
import { prescriptionDetached } from '../../features/cart/cartSlice';
import { prescriptionReviewed } from '../../features/prescriptions/prescriptionsSlice';
import { useToast } from '../../hooks/useToast';
import { formatDateTime, formatFileSize } from '../../utils/format';
import { PRESCRIPTION_FILE_RULES, validatePrescriptionFile } from '../../utils/validation';

const RX_STATUS = {
  pending: { label: 'Awaiting pharmacist review (simulated)', tone: 'warning' },
  approved: { label: 'Approved in simulated review', tone: 'success' },
  rejected: { label: 'Rejected in simulated review', tone: 'danger' },
};

const ACCEPT = Object.keys(PRESCRIPTION_FILE_RULES.types).join(',');

function FilePicker({ patientName }) {
  const dispatch = useDispatch();
  const toast = useToast();
  const inputId = useId();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');

  // Object URLs live only in memory and are revoked when the file changes or the component unmounts.
  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) {
      setPreviewUrl('');
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onChange = (event) => {
    const selected = event.target.files?.[0] ?? null;
    const message = selected ? validatePrescriptionFile(selected) : '';
    setError(message);
    setFile(message ? null : selected);
    if (message) event.target.value = '';
  };

  const onSubmit = () => {
    const result = dispatch(submitPrescription({ file, patientName }));
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast('Prescription submitted for simulated review', { tone: 'info', message: 'It has not been approved yet.' });
  };

  return (
    <div className="stack">
      <label htmlFor={inputId} className="dropzone">
        <Upload size={22} aria-hidden="true" />
        <span className="fw-600">Choose a prescription file</span>
        <span className="text-xs subtle">JPG, PNG, WEBP or PDF · max 5 MB · use a sample image, not a real prescription</span>
        <input id={inputId} type="file" accept={ACCEPT} onChange={onChange} className="sr-only" aria-describedby={error ? `${inputId}-err` : undefined} />
      </label>
      {error && (
        <p className="field__error" id={`${inputId}-err`} role="alert">
          {error}
        </p>
      )}
      {file && (
        <div className="file-preview">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview of the selected prescription file" />
          ) : (
            <div className="file-preview__icon" aria-hidden="true">
              <FileText size={28} />
            </div>
          )}
          <div className="stack stack--sm" style={{ flex: 1, minWidth: 0 }}>
            <p className="fw-600 text-sm" style={{ overflowWrap: 'anywhere' }}>
              {file.name}
            </p>
            <p className="text-xs subtle">
              {PRESCRIPTION_FILE_RULES.types[file.type]} · {formatFileSize(file.size)}
            </p>
            <div className="cluster">
              <Button size="sm" variant="primary" icon={ShieldCheck} onClick={onSubmit}>
                Submit for pharmacist review
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setFile(null)}>
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Prescription step for carts with Rx items. Approval is never automatic: the user (or the demo
 * pharmacy dashboard) must explicitly simulate a pharmacist decision.
 */
export default function PrescriptionUpload({ prescription, patientName }) {
  const dispatch = useDispatch();
  const toast = useToast();

  const simulate = (decision) => {
    dispatch(
      prescriptionReviewed({
        id: prescription.id,
        decision,
        note:
          decision === 'approved'
            ? 'Simulated approval — prototype only, does not authorise dispensing.'
            : 'Simulated rejection — e.g. prescription unclear or expired.',
      }),
    );
    toast(decision === 'approved' ? 'Simulated approval recorded' : 'Simulated rejection recorded', {
      tone: decision === 'approved' ? 'success' : 'warning',
    });
  };

  return (
    <section className="card card--pad stack" aria-labelledby="rx-heading">
      <div className="cluster cluster--between">
        <h2 id="rx-heading" className="card-title">
          Prescription
        </h2>
        {prescription && <Badge tone={RX_STATUS[prescription.status].tone}>{RX_STATUS[prescription.status].label}</Badge>}
      </div>
      <p className="text-sm muted">
        Your cart contains prescription-only items. In a real service a licensed pharmacist must review a valid prescription
        before these can be supplied. Here, the review is <strong>simulated</strong> and nothing is sent anywhere — the file
        never leaves your browser and is not saved.
      </p>

      {!prescription && <FilePicker patientName={patientName} />}

      {prescription && (
        <>
          <div className="file-preview">
            <div className="file-preview__icon" aria-hidden="true">
              <FileText size={28} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="fw-600 text-sm" style={{ overflowWrap: 'anywhere' }}>
                {prescription.fileName}
              </p>
              <p className="text-xs subtle">
                {formatFileSize(prescription.fileSize)} · submitted {formatDateTime(prescription.submittedAt)}
              </p>
              {prescription.reviewNote && <p className="text-xs muted" style={{ marginTop: 4 }}>{prescription.reviewNote}</p>}
            </div>
            <Button
              size="sm"
              variant="ghost"
              icon={Trash2}
              onClick={() => dispatch(prescriptionDetached())}
              aria-label="Remove prescription from cart"
            >
              {prescription.status === 'rejected' ? 'Upload another' : 'Remove'}
            </Button>
          </div>

          {prescription.status === 'pending' && (
            <Alert
              tone="demo"
              title="Prototype-only control"
              actions={
                <>
                  <Button size="sm" variant="primary" onClick={() => simulate('approved')}>
                    Simulate pharmacist approval
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => simulate('rejected')}>
                    Simulate rejection
                  </Button>
                </>
              }
            >
              There is no real pharmacist. Use these buttons — or the{' '}
              <Link to="/dashboard/pharmacy?tab=prescriptions">pharmacy dashboard review queue</Link> — to simulate a
              decision. A simulated approval does <strong>not</strong> authorise actual dispensing.
            </Alert>
          )}
          {prescription.status === 'rejected' && (
            <Alert tone="danger" title="Prescription not accepted (simulated)">
              Upload a different file or remove the prescription-only items to continue.
            </Alert>
          )}
        </>
      )}
    </section>
  );
}
