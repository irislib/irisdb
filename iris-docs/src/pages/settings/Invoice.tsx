import QrCode from '@/pages/settings/QrCode.tsx';
import CopyButton from '@/shared/components/CopyButton.tsx';

export function Invoice({ invoice, notice }: { invoice: string; notice?: string }) {
  return (
    <div className="flex flex-col items-center g12 txt-center">
      {notice && <b className="error">{notice}</b>}
      <QrCode data={invoice} link={`lightning:${invoice}`} />
      <div className="flex flex-col g12">
        <CopyButton text="Copy invoice" copyStr={invoice} className="items-center" />
        <a href={`lightning:${invoice}`}>
          <button type="button" className="btn btn-primary">
            Open Wallet
          </button>
        </a>
      </div>
    </div>
  );
}
