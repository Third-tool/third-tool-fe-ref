import React from "react";

/** 아이폰 느낌의 흰색 카드 */
export function PhoneMock({ children, style }) {
    return (
        <div style={{ ...sx.phone, ...style }}>
            <div style={sx.notch} />
            <div style={sx.screen}>{children}</div>
        </div>
    );
}

/** 말풍선 */
export function Bubble({ tone = "white", children, style }) {
    const tones = {
        white: { background: "#fff", color: "#223", boxShadow: "0 10px 24px rgba(0,0,0,.08)" },
        coral: { background: "#f66957", color: "#fff", boxShadow: "0 10px 24px rgba(246,105,87,.25)" },
    };
    return (
        <div style={{ ...sx.bubble, ...tones[tone], ...style }}>
            {children}
        </div>
    );
}

/** 기업 로고 칩 (텍스트 버전) */
export function LogoChip({ brand = "NAVER" }) {
    return (
        <div style={sx.chip}>
            <div style={sx.dot} />
            <span>{brand}</span>
        </div>
    );
}

const sx = {
    phone: {
        width: 420,
        borderRadius: 40,
        background: "#fff",
        border: "1px solid #e6e8ee",
        boxShadow: "0 20px 60px rgba(16,30,54,.18)",
    },
    notch: {
        height: 18,
        margin: "10px auto 0",
        width: 120,
        borderRadius: 10,
        background: "#e9edf5",
    },
    screen: {
        padding: 18,
        height: 640,
        borderRadius: 30,
        overflow: "hidden",
        background: "#fafbfd",
    },
    bubble: {
        borderRadius: 16,
        padding: "14px 16px",
        fontSize: 14,
    },
    chip: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "#fff",
        color: "#20334a",
        border: "1px solid #e7ebf3",
        borderRadius: 14,
        padding: "10px 14px",
        boxShadow: "0 10px 24px rgba(0,0,0,.06)",
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 999,
        background: "#4cc38a",
    },
};
