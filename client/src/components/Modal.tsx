interface ModalProps extends React.PropsWithChildren {};

export function Modal({ children }: ModalProps) {
  return (
    <div className="absolute top-0 left-0 bg-black/50 w-full h-full flex items-center justify-center z-40">
      <div className="bg-stone-800 text-white rounded p-3">{ children }</div>
    </div>
  );
}