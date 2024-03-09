import useLocalState from "@/state/useLocalState.ts";
import {Avatar} from "@/shared/components/Avatar.tsx";
import Show from "@/shared/components/Show.tsx";
import LoginDialog from "@/shared/components/LoginDialog.tsx";

export default function UserButton() {
  const [pubKey] = useLocalState('user/publicKey', '');

  return (
    <>
      <Show when={pubKey}>
        <div className="ml-2" onClick={() => document.getElementById('usermodal').showModal()}>
          <Avatar pubKey={pubKey} />
        </div>
      </Show>
      <Show when={!pubKey}>
        <div className="ml-2">
          <button
            className="btn btn-primary"
            onClick={() => {
              document.getElementById('usermodal').showModal();
            }}
          >
            Sign in
          </button>
        </div>
      </Show>
      <LoginModal />
    </>
  );
}

function LoginModal() {
  return (
    <dialog id="usermodal" className="modal">
      <div className="modal-box">
        <LoginDialog />
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}