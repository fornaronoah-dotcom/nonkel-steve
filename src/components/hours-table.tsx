import { HOURS, formatSlot } from "@/lib/site";

export function HoursTable({ light = false }: { light?: boolean }) {
  return (
    <table className="w-full text-left">
      <caption className="sr-only">Openingsuren</caption>
      <tbody>
        {HOURS.map(({ day, slot }) => (
          <tr key={day} className={`border-b ${light ? "border-white/15" : "border-coal/10"}`}>
            <th scope="row" className="py-2.5 pr-4 font-semibold">
              {day}
            </th>
            <td className={`py-2.5 text-right tabular-nums ${slot ? "" : "text-ketchup font-semibold"}`}>
              {formatSlot(slot)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
