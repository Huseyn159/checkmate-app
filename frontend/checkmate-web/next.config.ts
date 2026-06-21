import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    typescript: {
        // TypeScript xətaları olsa belə build prosesinin davam etməsinə icazə verir
        ignoreBuildErrors: true,
    },
    eslint: {
        // ESLint xətaları (xəbərdarlıqları) varsa, onlara da göz yumur
        ignoreDuringBuilds: true,
    }
};

export default nextConfig;