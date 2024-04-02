import QrCode from '@/pages/subscription/QrCode.tsx';
import CopyButton from '@/shared/components/CopyButton.tsx';

export function Invoice({ invoice, notice }: { invoice: string; notice?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 justify-center">
      {notice && <b className="error">{notice}</b>}
      <QrCode data={invoice} link={`lightning:${invoice}`} />
      <div className="flex flex-col gap-4">
        <CopyButton text="Copy invoice" copyStr={invoice} className="btn btn-sm" />
        <a href={`lightning:${invoice}`}>
          <button type="button" className="btn btn-primary">
            Open Wallet
          </button>
        </a>
      </div>
    </div>
  );
}
