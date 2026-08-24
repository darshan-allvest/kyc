'use client';

import { useRef, useState } from 'react';
import { CheckCircle2, Paperclip, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/button/Button';
import Text from '@/components/common/Text';
import KycLayout from '@/components/kyc/KycLayout';
import KycAlert from '@/components/kyc/KycAlert';
import { KYC_STEP, KYC_TYPO } from '@/constants/kycConstants';
import { mockUploadDocumentTypes } from '@/services/kyc/mockKycData';
import { uploadKycDocuments } from '@/services/kyc/mockKycService';
import useKycFlow from '@/hooks/kyc/useKycFlow';

const formatSize = (bytes) => `${Math.max(1, Math.round(bytes / 1024))} KB`;

/**
 * Scenario B, option 1 — manual document upload. Files are only read for their
 * name/size; nothing is uploaded anywhere.
 */
export default function DocumentUploadStep() {
  const { goToStep, updateFlow } = useKycFlow();
  const [files, setFiles] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef({});

  const requiredIds = mockUploadDocumentTypes.filter((doc) => doc.required).map((doc) => doc.id);
  const allRequiredPresent = requiredIds.every((id) => files[id]);

  const handlePick = (docId) => (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFiles((prev) => ({
      ...prev,
      [docId]: { fileName: file.name, size: formatSize(file.size) },
    }));
    setError('');
  };

  const handleRemove = (docId) => {
    setFiles((prev) => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
    if (inputRefs.current[docId]) inputRefs.current[docId].value = '';
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    const result = await uploadKycDocuments(
      Object.entries(files).map(([id, file]) => ({ id, ...file }))
    );
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    updateFlow({
      uploadedDocuments: Object.entries(files).map(([id, file]) => ({
        id,
        ...file,
        status: 'Uploaded',
      })),
    });
    goToStep(KYC_STEP.GOVERNMENT_FETCH);
  };

  return (
    <KycLayout
      title="Upload your documents"
      subtitle="Add a clear photo or PDF of each document. Max 5 MB per file."
      showStepper
      currentStep={KYC_STEP.DOCUMENT_UPLOAD}
      maxWidth="max-w-[30rem]"
      onBack={() => goToStep(KYC_STEP.METHOD_CHOICE)}
      footer={
        <Button
          variant="authSubmit"
          size="lg"
          fullWidth
          weight="bold"
          loading={loading}
          disabled={!allRequiredPresent}
          className="text-[14px]"
          onClick={handleSubmit}
        >
          {loading ? 'Uploading documents...' : 'Upload Documents'}
        </Button>
      }
    >
      <ul className="space-y-3">
        {mockUploadDocumentTypes.map((doc) => {
          const picked = files[doc.id];

          return (
            <li
              key={doc.id}
              className={cn(
                'rounded-xl border p-3.5',
                picked
                  ? 'border-brand-500/60 bg-brand-500/5 dark:bg-brand-shade'
                  : 'border-gray-200 dark:border-homepage-borderColor dark:bg-homepage-cardBgDark'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Text className={cn(KYC_TYPO.subtitle, 'font-medium')}>
                    {doc.label}
                    {doc.required && (
                      <span className="ml-0.5 text-brandRed-loss" aria-hidden="true">
                        *
                      </span>
                    )}
                  </Text>
                  <Text className={cn(KYC_TYPO.body, 'mt-0.5')} color="text-gray-500 dark:text-homepage-darkGrey">
                    {doc.hint}
                  </Text>
                </div>

                {picked ? (
                  <span className="flex shrink-0 items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-brand-500" aria-hidden="true" />
                    <Text as="span" className={KYC_TYPO.body} color="text-brand-500" weight="semibold">
                      Added
                    </Text>
                  </span>
                ) : null}
              </div>

              <input
                ref={(node) => {
                  inputRefs.current[doc.id] = node;
                }}
                id={`kyc-doc-${doc.id}`}
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={handlePick(doc.id)}
                className="sr-only"
              />

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={Paperclip}
                  className="min-h-11 text-[12px]"
                  onClick={() => inputRefs.current[doc.id]?.click()}
                >
                  {picked ? 'Replace file' : 'Choose file'}
                </Button>

                {picked && (
                  <>
                    <Text
                      as="span"
                      className={cn(KYC_TYPO.body, 'min-w-0 max-w-[55%] truncate')}
                      color="text-gray-700 dark:text-homepage-lightWhite"
                    >
                      {picked.fileName} · {picked.size}
                    </Text>
                    <button
                      type="button"
                      onClick={() => handleRemove(doc.id)}
                      className="inline-flex size-11 items-center justify-center rounded-full text-brandRed-loss transition-colors duration-200 hover:bg-brandRed-loss/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandRed-loss"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      <span className="sr-only">Remove {doc.label}</span>
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {error && <KycAlert tone="error" className="mt-4">{error}</KycAlert>}

      {!allRequiredPresent && !error && (
        <Text className={cn(KYC_TYPO.body, 'mt-4')} color="text-gray-500 dark:text-homepage-darkGrey">
          Add all documents marked with * to continue.
        </Text>
      )}
    </KycLayout>
  );
}
