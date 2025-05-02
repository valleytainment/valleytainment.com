/**
 * =====================================================================
 * | VALLEYTAINMENT PRODUCTIONS - DEPLOYMENT CONFIGURATION             |
 * | Version: 1.0.0                                                    |
 * | Last Updated: April 19, 2025                                      |
 * =====================================================================
 * | This file contains configuration for deploying the Valleytainment |
 * | website to various hosting platforms.                             |
 * =====================================================================
 */

module.exports = {
  // Site information
  site: {
    name: "Valleytainment Productions",
    description: "Entertainment & Content Creation",
    url: "https://valleytainment.com",
    author: "Valleytainment Productions",
    version: "2.0.0"
  },
  
  // Build settings
  build: {
    outputDir: "dist",
    assetsDir: "assets",
    minify: true,
    sourceMaps: false,
    cache: true
  },
  
  // Netlify configuration
  netlify: {
    headers: [
      {
        "source": "/*",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Referrer-Policy",
            "value": "strict-origin-when-cross-origin"
          },
          {
            "key": "Permissions-Policy",
            "value": "geolocation=self"
          }
        ]
      },
      {
        "source": "/*.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "/*.css",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "/images/*",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ],
    redirects: [
      {
        "from": "/home",
        "to": "/",
        "status": 301,
        "force": true
      }
    ]
  },
  
  // Vercel configuration
  vercel: {
    cleanUrls: true,
    trailingSlash: false,
    headers: [
      {
        "source": "/(.*)",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          }
        ]
      }
    ]
  },
  
  // GitHub Pages configuration
  githubPages: {
    cname: "valleytainment.com",
    nojekyll: true
  },
  
  // AWS S3 configuration
  awsS3: {
    region: "us-east-1",
    bucket: "valleytainment-website",
    cloudfrontDistribution: "E1ABCDEFGHIJKL"
  }
};
