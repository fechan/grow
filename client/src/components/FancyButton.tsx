export function FancyButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={ "btn " + props.className }>{ props.children }</button>
  );
}