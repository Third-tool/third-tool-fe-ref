// src/components/CharacterReadingSVG.jsx
import { motion } from "framer-motion";

export default function CharacterReadingSVG({ className = "" }) {
    const baseProps = {
        className,
        width: "100%", // 부모 요소에 맞춰 크기 조절
        height: "100%", // 부모 요소에 맞춰 크기 조절
        viewBox: "0 0 360 300", // 기존 뷰박스 유지하면서 내부 요소 크기 조정
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
    };

    const S = { stroke: "#fff", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" }; // 선 굵기 증가
    const C_FILL = "#fff";
    const CHAIR_FILL = "#222"; // 의자/테이블 색상 더 어둡게
    const CHAIR_STROKE = "#555";
    const BOOK_FILL = "#ddd"; // 책 색상 더 밝게
    const BOOK_STROKE = "#777";
    const COFFEE_FILL = "#eee"; // 커피잔 색상 더 밝게
    const COFFEE_STROKE = "#777";

    return (
        <motion.svg
            {...baseProps}
            // StartPage에서 애니메이션 제어하므로 여기서는 제거
        >
            {/* 테이블 */}
            <path
                d="M100 190 C 100 180, 200 180, 200 190 C 200 200, 100 200, 100 190 Z"
                fill={CHAIR_FILL}
                stroke={CHAIR_STROKE}
                strokeWidth="2"
            />
            <path d="M150 195 V 270" stroke={CHAIR_STROKE} strokeWidth="2" />
            <path d="M130 270 H 170" stroke={CHAIR_STROKE} strokeWidth="3" strokeLinecap="round" />

            {/* 의자 */}
            <path
                d="M210 280 H 310 V 290 H 210 V 280 Z"
                fill={CHAIR_FILL}
                stroke={CHAIR_STROKE}
                strokeWidth="2"
            />
            <path
                d="M210 160 H 225 V 280 H 210 V 160 Z"
                fill={CHAIR_FILL}
                stroke={CHAIR_STROKE}
                strokeWidth="2"
            />
            <path d="M218 280 L 230 250" stroke={CHAIR_STROKE} strokeWidth="2" />
            <path d="M218 210 H 280" stroke={CHAIR_STROKE} strokeWidth="2" />
            <path d="M280 150 C 290 150, 300 160, 300 180 V 250 H 280 V 150 Z"
                  fill={CHAIR_FILL}
                  stroke={CHAIR_STROKE}
                  strokeWidth="2"
            />
            <path d="M292 280 L 280 250" stroke={CHAIR_STROKE} strokeWidth="2" />

            {/* 캐릭터 - 위치 및 크기 조정 */}
            <g transform="translate(40 -10) scale(1.1)"> {/* 전체적으로 오른쪽으로 이동, 살짝 위로, 크기 키움 */}
                {/* 몸통 */}
                <path
                    d="M220 200 C 210 220, 210 240, 220 260 L 260 260 C 270 240, 270 220, 260 200 Z"
                    fill={C_FILL}
                />
                {/* 다리 */}
                <path
                    d="M225 258 C 215 270, 200 280, 190 275"
                    stroke={C_FILL}
                    strokeWidth="10" // 졸라맨 느낌으로 굵게
                    strokeLinecap="round"
                />
                <path
                    d="M255 258 C 250 270, 240 280, 230 275"
                    stroke={C_FILL}
                    strokeWidth="10" // 졸라맨 느낌으로 굵게
                    strokeLinecap="round"
                />
                {/* 머리 */}
                <circle cx="240" cy="180" r="28" fill={C_FILL} /> {/* 머리 크기 살짝 키움 */}
                {/* 팔 & 책 */}
                <path
                    d="M220 210 C 200 215, 180 210, 170 190"
                    stroke={C_FILL}
                    strokeWidth="10" // 졸라맨 느낌으로 굵게
                    strokeLinecap="round"
                />
                <path
                    d="M260 210 C 280 215, 300 210, 310 190"
                    stroke={C_FILL}
                    strokeWidth="10" // 졸라맨 느낌으로 굵게
                    strokeLinecap="round"
                />
                <path
                    d="M175 195 L 195 180 L 305 180 L 305 205 L 195 220 L 175 195 Z"
                    fill={BOOK_FILL}
                    stroke={BOOK_STROKE}
                    strokeWidth="1"
                />
                {/* 책 디테일 */}
                <path d="M197 181 L 197 218" stroke={BOOK_STROKE} strokeWidth="1" />
                <path d="M205 185 L 235 188" stroke={BOOK_STROKE} strokeWidth="1" />
                <path d="M205 195 L 245 198" stroke={BOOK_STROKE} strokeWidth="1" />
                <path d="M205 205 L 225 208" stroke={BOOK_STROKE} strokeWidth="1" />
            </g>

            {/* 커피 - 위치 및 스타일 조정 */}
            <g transform="translate(0 10)"> {/* 살짝 아래로 내림 */}
                <path
                    d="M130 170 C 130 165, 145 165, 145 170 V 185 H 130 V 170 Z"
                    fill={COFFEE_FILL}
                    stroke={COFFEE_STROKE}
                    strokeWidth="1"
                />
                <path
                    d="M145 172 C 150 172, 150 178, 145 178"
                    stroke={COFFEE_STROKE}
                    strokeWidth="1"
                />
                {/* 김 */}
                <motion.path
                    d="M134 165 C 134 160, 138 160, 138 165"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    initial={{ y: 0, opacity: 0.8 }}
                    animate={{ y: -8, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0, ease: "easeOut" }}
                />
                <motion.path
                    d="M141 165 C 141 160, 145 160, 145 165"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    initial={{ y: 0, opacity: 0.7 }}
                    animate={{ y: -10, opacity: 0 }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: 0.5, ease: "easeOut" }}
                />
            </g>
        </motion.svg>
    );
}