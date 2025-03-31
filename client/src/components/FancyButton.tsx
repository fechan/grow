export function FancyButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="border p-2 hover:bg-blue-200/50" {...props}>{ props.children }</button>
  );
}