import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, ogImage, canonicalUrl }) => {
    const siteTitle = "DualCode - Solusi Project IT & Pengerjaan Software Premium";
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const defaultDescription = "DualCode - Solusi Jasa Pembuatan Web & Pengerjaan Project IT Terpercaya. Bantu tugas koding, website perusahaan, dan project startup dengan kualitas premium.";
    const metaDescription = description || defaultDescription;
    const metaKeywords = keywords ? `${keywords}, dualcode web, jasa coding` : "dualcode, jasa joki web, jasa joki koding, pengerjaan tugas pemrograman, jasa pembuatan website, joki skripsi informatika";
    const siteUrl = "https://dualcode.vercel.app";
    const fullCanonicalUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            <meta name="keywords" content={metaKeywords} />
            <link rel="canonical" href={fullCanonicalUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={fullCanonicalUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            {ogImage && <meta property="og:image" content={ogImage} />}

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={fullCanonicalUrl} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={metaDescription} />
            {ogImage && <meta property="twitter:image" content={ogImage} />}
        </Helmet>
    );
};

export default SEO;
