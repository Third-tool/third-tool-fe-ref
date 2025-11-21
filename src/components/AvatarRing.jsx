import Avvvatars from "avvvatars-react";

export default function AvatarRing({ seeds = ["kafka", "sm2", "leitner", "nori", "elastic", "ttt"] }) {
    return (
        <div style={{ display: "flex", gap: 8 }}>
            {seeds.map((s, i) => (
                <div key={i}>
                    <Avvvatars value={s} size={44} />
                </div>
            ))}
        </div>
    );
}
