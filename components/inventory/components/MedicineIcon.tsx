import { Pill, Syringe, Droplets, Archive } from "lucide-react";

export function getMedicineIcon(type: string, className: string = "w-5 h-5 text-primary") {
    switch (type.toLowerCase()) {
        case "tablet":
        case "capsule":
            return <Pill className={className} />;
        case "syrup":
        case "drops":
            return <Droplets className={className} />;
        case "injection":
            return <Syringe className={className} />;
        default:
            return <Archive className={className} />;
    }
}
