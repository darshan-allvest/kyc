'use client';

import { useRef, useState } from 'react';
import { Eraser, Trash2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import KycLayout from '@/components/kyc/KycLayout';
import KycAlert from '@/components/kyc/KycAlert';
import SignaturePad from '@/components/kyc/SignaturePad';
import { KYC_STEP, KYC_TYPO, SIGNATURE_UPLOAD } from '@/constants/kycConstants';
import { submitSignature } from '@/services/kyc/mockKycService';
import useKycFlow from '@/hooks/kyc/useKycFlow';

const formatSize = (bytes) => `${Math.max(1, Math.round(bytes / 1024))} KB`;

/**
 * Step — signature. Both are required: a signature drawn in the pad and a
 * scanned/photographed signature uploaded from the device. Everything stays in
 * flow state as data URLs; nothing is uploaded anywhere.
 */
export default function SignatureStep() {
  const { goToStep, updateFlow, signatureUpload } = useKycFlow();
  const padRef = useRef(null);
  const fileInputRef = useRef(null);
  const [hasInk, setHasInk] = useState(false);
  const [upload, setUpload] = useState(signatureUpload || null);
  const [uploadError, setUploadError] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleClear = () => {
    padRef.current?.clear();
    setError('');
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError('');
    if (!SIGNATURE_UPLOAD.acceptedTypes.includes(file.type)) {
      setUploadError('Upload a PNG or JPG image of your signature.');
      return;
    }
    if (file.size > SIGNATURE_UPLOAD.maxBytes) {
      setUploadError(`Keep the file under ${SIGNATURE_UPLOAD.maxBytes / (1024 * 1024)} MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadError('');
      setUpload({ dataUrl: String(reader.result), fileName: file.name, size: file.size });
    };
    reader.onerror = () => setUploadError('We could not read that file. Try another one.');
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    const drawn = padRef.current?.isEmpty() ? null : padRef.current?.toDataURL();

    if (!drawn) {
      setError('Draw your signature before submitting.');
      return;
    }
    if (!upload) {
      setError('Upload an image of your signature as well.');
      return;
    }

    setError('');
    setSubmitting(true);
    const result = await submitSignature({ drawn, uploaded: upload });
    setSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    updateFlow({ signature: drawn, signatureUpload: upload });
    goToStep(KYC_STEP.DOCUMENT);
  };

  return (
    <KycLayout
      title="Add your signature"
      subtitle="Sign inside the box and upload a picture of your signature — both are required."
      showStepper
      currentStep={KYC_STEP.SIGNATURE}
      onBack={() => goToStep(KYC_STEP.SELFIE)}
    >
      <Text className={cn(KYC_TYPO.label, 'mb-1.5')} color="text-gray-700 dark:text-white">
        Draw your signature
        <span className="ml-0.5 text-brandRed-loss" aria-hidden="true">
          *
        </span>
      </Text>

      <SignaturePad ref={padRef} onChange={setHasInk} height={200} />

      <div className="mt-2 flex items-center justify-between gap-2">
        <Text className={KYC_TYPO.body} color="text-gray-500 dark:text-homepage-darkGrey">
          {hasInk ? 'Sign as you would on paper.' : 'The box is empty — draw your signature.'}
        </Text>
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold text-brand-500 transition-colors duration-200 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Eraser className="size-3.5" aria-hidden="true" />
          Clear
        </button>
      </div>

      {/* Uploaded signature */}
      <div className="mt-5">
        <Text className={cn(KYC_TYPO.label, 'mb-1.5')} color="text-gray-700 dark:text-white">
          Upload your signature
          <span className="ml-0.5 text-brandRed-loss" aria-hidden="true">
            *
          </span>
        </Text>

        <input
          ref={fileInputRef}
          type="file"
          accept={SIGNATURE_UPLOAD.acceptedTypes.join(',')}
          onChange={handleFile}
          className="sr-only"
          aria-label="Upload a picture of your signature"
        />

        {upload ? (
          <div className="rounded-xl border border-gray-200 p-3 dark:border-white/10 dark:bg-black/20">
            <div className="flex h-24 items-center justify-center overflow-hidden rounded-lg bg-white">
              {/* Local data URL — next/image would add no value here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={upload.dataUrl}
                alt="Your uploaded signature"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between gap-2">
              <Text
                className={cn(KYC_TYPO.body, 'min-w-0 truncate')}
                color="text-gray-600 dark:text-homepage-softGray"
              >
                {upload.fileName} · {formatSize(upload.size)}
              </Text>
              <button
                type="button"
                onClick={() => {
                  setUpload(null);
                  setUploadError('');
                }}
                className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-2 text-[12px] font-semibold text-brandRed-loss transition-colors duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-4 py-6 transition-colors duration-200 hover:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-white/20 dark:bg-black/20"
          >
            <Upload className="size-5 text-brand-500" aria-hidden="true" />
            <Text className={KYC_TYPO.subtitle} color="text-gray-700 dark:text-white">
              Choose a file
            </Text>
            <Text className={KYC_TYPO.body} color="text-gray-500 dark:text-homepage-darkGrey">
              PNG or JPG on white paper, up to{' '}
              {SIGNATURE_UPLOAD.maxBytes / (1024 * 1024)} MB
            </Text>
          </button>
        )}

        {uploadError && (
          <KycAlert tone="error" className="mt-3">
            {uploadError}
          </KycAlert>
        )}
      </div>

      {error && (
        <KycAlert tone="error" className="mt-3">
          {error}
        </KycAlert>
      )}

      <Button
        variant="authSubmit"
        size="lg"
        fullWidth
        weight="bold"
        loading={submitting}
        disabled={!hasInk || !upload}
        className={cn('mt-5 text-[14px]')}
        onClick={handleSubmit}
      >
        {submitting ? 'Saving signature...' : 'Submit Signature'}
      </Button>

      {(!hasInk || !upload) && !error && (
        <Text
          className={cn(KYC_TYPO.body, 'mt-2')}
          align="center"
          color="text-gray-500 dark:text-homepage-darkGrey"
        >
          {!hasInk && !upload
            ? 'Draw your signature and upload an image to continue.'
            : !hasInk
              ? 'Draw your signature to continue.'
              : 'Upload an image of your signature to continue.'}
        </Text>
      )}
    </KycLayout>
  );
}
