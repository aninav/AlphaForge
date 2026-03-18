/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow framing the Streamlit app in the terminal page
  async headers() {
    return [
      {
        source: "/terminal",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
