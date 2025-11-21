import React from 'react';
import { motion } from 'framer-motion';

/**
 * 전구 아이콘 SVG 컴포넌트 (퀄리티 향상 버전)
 * framer-motion을 사용해 등장 애니메이션 효과를 줍니다.
 */
export default function AnimatedLightbulbSVG({ style }) {
    return (
        <motion.svg
            width="140"
            height="140"
            viewBox="0 0 64 64"
            style={style}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            {/* 💡 그라데이션 정의 */}
            <defs>
                <linearGradient id="bulbGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFF9C4" /> {/* 밝은 상단 */}
                    <stop offset="50%" stopColor="#FDD835" /> {/* 중간 노란색 */}
                    <stop offset="100%" stopColor="#FBC02D" /> {/* 어두운 하단 */}
                </linearGradient>
                <linearGradient id="filamentGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFECB3" />
                    <stop offset="100%" stopColor="#FFA000" />
                </linearGradient>
            </defs>

            {/* 전구 내부 (그라데이션 채우기) */}
            <path
                d="M32,10 C20.95,10 12,18.95 12,30 C12,40.48 20.24,48.42 30,48.98 V53 H34 V48.98 C43.76,48.42 52,40.48 52,30 C52,18.95 43.05,10 32,10 Z"
                fill="url(#bulbGradient)" // ✅ 그라데이션 적용
            />

            {/* 전구 테두리 (약간 밝은 회색으로 변경하여 부드럽게) */}
            <path
                d="M32,10 C20.95,10 12,18.95 12,30 C12,40.48 20.24,48.42 30,48.98 V53 H26 V55 H38 V53 H34 V48.98 C43.76,48.42 52,40.48 52,30 C52,18.95 43.05,10 32,10 Z"
                fill="none"
                stroke="#616161" // ✅ 테두리 색상 변경
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* ✅ 필라멘트 디테일 향상: 여러 개의 얇은 선으로 구성 */}
            <g stroke="url(#filamentGradient)" strokeWidth="1.8" strokeLinecap="round"> {/* ✅ 그라데이션 적용 */}
                <line x1="28" y1="36" x2="36" y2="36" />
                <line x1="29" y1="32" x2="35" y2="32" />
                <line x1="30" y1="28" x2="34" y2="28" />
                <line x1="31" y1="24" x2="33" y2="24" />
            </g>

            {/* 전구 베이스 (소켓 부분) - 약간 디테일 추가 */}
            <g stroke="#616161" strokeWidth="2.5" strokeLinecap="round"> {/* ✅ 색상 변경 */}
                <line x1="27" y1="50" x2="37" y2="50" />
                <line x1="26" y1="53" x2="38" y2="53" />
                <line x1="28" y1="56" x2="36" y2="56" /> {/* 추가적인 라인 */}
            </g>

            {/* ✅ 전구 상단에 작은 하이라이트 추가 */}
            <circle cx="32" cy="14" r="2" fill="#FFFFFF" opacity="0.6" />

        </motion.svg>
    );
}