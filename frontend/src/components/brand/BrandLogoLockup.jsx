import React from "react";
import logo from "../../assets/brand/logo.png";

/**
 * 공용 로고 이미지 래퍼
 * - size: 높이(px)
 */
export default function BrandLogoLockup({
                                            size = 36,
                                            alt = "Third tool",
                                            style,
                                            ...rest
                                        }) {
    return (
        <img
            src={logo}
            alt={alt}
            style={{
                height: size,
                width: "auto",
                display: "block",
                ...style,
            }}
            draggable={false}
            {...rest}
        />
    );
}
