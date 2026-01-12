import { supportedChains } from "@/lib/chains";

type Props = {
  value: string;
  onChange: (val: string) => void;
  disabledIds?: number[];
};

export function NetworkSelector({ value, onChange, disabledIds = [] }: Props) {
  return (
    <select
      className="bg-white/5 rounded-lg px-4 py-2 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {supportedChains.map((chain) => (
        <option key={chain.id} value={chain.network} disabled={disabledIds.includes(chain.id)}>
          {chain.name}
        </option>
      ))}
    </select>
  );
}
