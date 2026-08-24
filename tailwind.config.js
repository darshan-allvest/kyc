const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      width: {
        '15rem': '15rem', // custom utility
        '26rem': '26rem',
      },
      backgroundImage: {
        'card-shade-dark': `
          radial-gradient(70% 100% at 0% 0%, rgba(58,64,99,.75) 0%, transparent 100%),
          radial-gradient(110% 120% at 100% 100%, rgba(58,64,99,.55) 0%, transparent 90%)
        `,
        'card-shade-light': `
          radial-gradient(120% 120% at 0% 0%, rgba(200,200,255,.4) 0%, transparent 60%),
          radial-gradient(120% 120% at 100% 100%, rgba(200,200,255,.4) 0%, transparent 60%)
        `,
        // Deep-black surface (#0d0d0d) with subtle bluish corner glows — same shape
        // as card-shade-dark but with the deep-black baked in as the base layer.
        'card-shade-deep': `
          radial-gradient(70% 100% at 0% 0%, rgba(58,64,99,.65) 0%, transparent 100%),
          radial-gradient(110% 120% at 100% 100%, rgba(58,64,99,.65) 0%, transparent 90%),
          linear-gradient(#0d0d0d, #0d0d0d)
        `,
        'gradient-purple-glow':
          'linear-gradient(to bottom right, rgba(115,113,252,0.4), #7371FC)',
        'custom-radial':
          'radial-gradient(closest-side, rgba(74,124,24,0.35), #000000)',
        'main-banner': "url('/assets/img/main-banner.jpg')",
        'container-gradient':
          'linear-gradient(to bottom, #202020cc 0%, #202020 65%, #7371fc66 100%)',
        'gradient-sip': 'linear-gradient(to right, #4E4D9E, #7371FC)',
        // Market banner gradients (match Flutter ThemeGradients)
        'gradient-market-bullish':
          'linear-gradient(to right, #4D6600 15.5%, #99CC00 167%)',
        'gradient-market-bearish':
          'linear-gradient(to right, #AF2520 30.6%, #590D0A 100%)',
        'gradient-profit-glow':
          'linear-gradient(135deg, rgba(174,243,31,0.15) 0%, #1a1a1a 30%, #1a1a1a 70%, rgba(174,243,31,0.1) 100%)',
        'gradient-loss-glow':
          'linear-gradient(135deg, rgba(255,77,92,0.15) 0%, #1a1a1a 30%, #1a1a1a 70%, rgba(255,77,92,0.1) 100%)',
        'gradient-profit-inner':
          'linear-gradient(160deg, #1a2010 0%, #141a10 40%, #12160e 100%)',
        'gradient-loss-inner':
          'linear-gradient(160deg, #201410 0%, #1a1210 40%, #16100e 100%)',
        'radial-profit-glow':
          'radial-gradient(circle, rgba(120, 200, 20, 0.35) 0%, rgba(80, 160, 10, 0.15) 40%, transparent 70%)',
        'radial-loss-glow':
          'radial-gradient(circle, rgba(255, 77, 92, 0.35) 0%, rgba(200, 40, 50, 0.15) 40%, transparent 70%)',
        'radial-profit-bloom':
          'radial-gradient(circle, rgba(100, 180, 20, 0.2) 0%, rgba(60, 140, 10, 0.08) 50%, transparent 75%)',
        'radial-loss-bloom':
          'radial-gradient(circle, rgba(255, 77, 92, 0.2) 0%, rgba(200, 40, 50, 0.08) 50%, transparent 75%)',
        'radial-profit-subtle':
          'radial-gradient(circle, rgba(100, 180, 20, 0.1) 0%, transparent 70%)',
        'radial-loss-subtle':
          'radial-gradient(circle, rgba(255, 77, 92, 0.1) 0%, transparent 70%)',
        'gradient-purple-outer':
          'linear-gradient(135deg, rgba(115,113,252,0.15) 0%, #1a1a1a 30%, #1a1a1a 70%, rgba(115,113,252,0.1) 100%)',
        'gradient-purple-inner':
          'linear-gradient(160deg, #10101a 0%, #0e0e18 40%, #0c0c16 100%)',
        'radial-purple-glow':
          'radial-gradient(circle, rgba(115, 113, 252, 0.35) 0%, rgba(80, 78, 200, 0.15) 40%, transparent 70%)',
        'radial-purple-bloom':
          'radial-gradient(circle, rgba(115, 113, 252, 0.2) 0%, rgba(80, 78, 200, 0.08) 50%, transparent 75%)',
        'radial-purple-subtle':
          'radial-gradient(circle, rgba(115, 113, 252, 0.1) 0%, transparent 70%)',
        'score-bar-gradient':
          'linear-gradient(90deg, #FF4D5C 0%, #F87733 25%, #99CC00 60.1%)',
      },
      boxShadow: {
        'glow-purple-glow': '0 0 95px rgba(115, 113, 252, 0.4)',
        'card-dark': '0px 4px 11px 0px rgba(0, 0, 0, 0.5)',
        'inset-profit': 'inset -8px 1px 17.5px 0px rgba(174, 243, 31, 0.33)',
        'inset-loss': 'inset -8px 1px 17.5px 0px rgba(255, 77, 92, 0.33)',
        'card-purple': '0px 4.59px 12.63px 0px #00000080',
        'inset-purple': 'inset -9.18px 1.15px 20.09px 0px #7371FC54',
      },
      fontFamily: {
        inter: ['var(--font-inter)', 'sans-serif'],
        sora: ['var(--font-sora)', 'sans-serif'],
        eina: ['var(--font-inter)', 'sans-serif'],
      },
      keyframes: {
        'caret-blink': {
          '0%,70%,100%': {
            opacity: '1',
          },
          '20%,50%': {
            opacity: '0',
          },
        },
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'loop-scroll': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'nudge-right': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(4px)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(0.75)', opacity: '0.4' },
        },
      },
      animation: {
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'loop-scroll': 'loop-scroll 50s linear infinite',
        'nudge-right': 'nudge-right 1s ease-in-out infinite',
        heartbeat: 'heartbeat 1.4s ease-in-out infinite',
      },
      letterSpacing: {
        extra: '0.08em', // 8% letter spacing
      },
      fontSize: {
        '36px': ['36px', '120%'],
        '28px': ['28px', '160%'],
        '26px': ['26px', '160%'],
        '24px': ['24px', '160%'],
        '22px': ['22px', '160%'],
        '20px': ['20px', '120%'],
        '16px': ['16px', '160%'],
        '14px': ['14px', '160%'],
        '12px': ['12px', '120%'],
        '10px': ['10px', '160%'],
      },
      colors: {
        tableTheme: {
          //If table needed to be matched with card theme, use below colors
          // tableHeader: '#191d29', // slate-tinted deep header
          // tableStripe1: '#111318', // deep-black + faint slate
          // tableStripe2: '#0d0d0d', // deep-black base (matches card)
          // tableBorder: '#494949', // matches gradient-card border
          // tableRowBorder: '#242938', // subtle slate-blue divider
          tableHeader: '#141414',
          tableStripe1: '#1A1A1A',
          tableStripe2: '#1F1F1F',
          tableBorder: '#494949',
          tableRowBorder: '#2A2A2A',
          // Header / totals band that sits *above* the stripes in elevation.
          // Mirrors the app's surfaceContainerHigh (market_depth.dart).
          tableBand: '#2B2B2B',
        },
        'container-black': '#202020',
        'nse-exchange': '#F87733',
        'bse-exchange': '#7371FC',
        homepage: {
          purple: '#7371FC',
          pink: '#ec4899',
          white: '#F1F2F2',
          white12: '#FFFFFF1F', // White-12 (12% bg)
          lightWhite: '#C6C6C6',
          tabInactive: '#C6C6C6',
          gray: '#888888',
          lightGray: '#D9D9D9',
          horizontalLine: '#CCCCCC66',
          darkGreen: '#0E423E',
          orange: '#F87733',
          darkOrange: '#2f1e14',
          borderColor: '#494949', // CARD BORDER COLOR
          borderShade: '#3C3C3C',
          borderDark: '#303030',
          buyInput: '#2E2E2E',
          buyModal: '#202020', // CARD BG COLOR
          accordianColor: '#282828',
          black: '#231F20',
          disableGray: '#585858',
          mediumGray: '#5D5D5D',
          darkBluePurple: '#2C314A',
          borderBluePurple: '#4443a2',
          darkGrey: '#7D7D7D',
          darkerGrey: '#3A3A3A',
          dropdownLabel: '#D2D2D2',
          checkboxBorder: '#AEAEAE',
          tableStripeColor: '#2c2c2c',
          tableHeaderBottomBorder: '#616161',
          tableCellBorder: '#505050',
          iconBackground: '#2D2D2D',
          slateGray: '#364153',
          darkSlate: '#1E2939',
          btnActive: '#25271f',
          skeletonBg: '#2A2B30', // Skeleton/Loader background color
          authBg: '#1a1a1a', // Auth pages background
          labelGray: '#55555E', // Form label color
          cardBgDark: '#141414', // Dark card background
          deepBlack: '#0d0d0d', // Very dark background
          tooltipBg: '#1E1F24', // Tooltip/popup background
          cyan: '#00D9FF', // Cyan accent color
          softGray: '#BFBFBF', // Soft gray text
          hoverBg: '#1f1f1f', // Hover background
          cardBg: '#242424', // Card/badge background
          gold: '#FFB800', // Gold accent color
          lime: '#8BC34A', // Lime green for checkboxes
          limeDark: '#7CB342', // Darker lime green
          brightGreen: '#76FF33', // Bright green
          darkCard: '#1A1B1F', // Dark card background
          darkCard2: '#1C1F26', // Dark card variant
          inputBg: '#1E1E1E', // Input field background
          inputBg2: '#232323', // Input background variant
          darkerCard: '#111111', // Darker card background
          badgeBg: '#1f2430', // Badge background
          badgeBorder: '#2e323a', // Badge border
          lightGrayDot: '#E5E7EB', // Light gray for dots
          mediumGray2: '#7a7a7a', // Medium gray variant
          greenBg: '#171D0C', // Green background for cards
          greenBgLight: '#1E2A0F', // Light green background
          greenBorder: '#5FA800', // Green border
          inputBgLight: '#E7E7E7', // Light input/border in light-themed modals
          darkTeal: '#083A3A', // Dark teal for resend link in light modals
          progressBg: '#2B2F34',
          textThird: '#717171',
        },
        brand: {
          50: '#F2F9E6',
          100: '#E6F2CC',
          200: '#CCE699',
          300: '#B3D966',
          400: '#99CC33',
          500: '#99CC00', // Brand Green Color BG
          12: '#99CC001F', // Brand-color-12 (12% bg)
          600: '#80B300',
          700: '#668A00',
          800: '#4D6600',
          900: '#333D00',
          shade: '#99CC001A',
          disabled: '#818181',
          bgApp: '#191919',
          profit: '#76BC4A', // Number/TEXT/ Border only Green Color
          tableHeader: '#202020',
          black: '#000000',
          borderGreen: '#B3FF00',
          infoBadge: '#2a2e1d',
          darkGreenBg: '#1f4737',
        },
        brandRed: {
          50: '#FFF5F5',
          100: '#FFE5E7',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#AF2520', // your base Primary Red BG
          12: '#AF25201F', // Primary-red-12 (12% bg)
          loss: '#FF4D5C', // your lighter accent- Number Red- Number/TEXT/ Border only Red Color
          600: '#BF0413', // your darker accent
          800: '#8A0A10',
          900: '#340c08',
          950: '#210e0c', // near-black red deep shade
        },
        background: {
          100: 'var(--background-100)',
          500: '#191919',
          600: '#666666',
          800: '#353535',
          900: 'var(--background-900)',
        },
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      borderWidth: {
        tiny: '0.1px',
      },
      strategyCardChart: {},
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    function ({ addUtilities }) {
      addUtilities(
        {
          '.no-scrollbar': {
            '-ms-overflow-style': 'none', // For IE and Edge
            'scrollbar-width': 'none', // For Firefox
          },
          '.no-scrollbar::-webkit-scrollbar': {
            display: 'none', // Hides scrollbar for Webkit browsers (Chrome, Safari)
          },
          '.dark .before-overlay:before': {
            content: "''",
            width: '100%',
            background: '#231f208a',
            display: 'block',
            position: 'absolute',
            top: '0',
            bottom: '0',
            left: '0',
            right: '0',
            borderRadius: '.4rem',
            zIndex: '0',
          },
          '.before-overlay:before': {
            content: "''",
            width: '100%',
            display: 'block',
            position: 'absolute',
            top: '0',
            bottom: '0',
            left: '0',
            right: '0',
            borderRadius: '.4rem',
            zIndex: '0',
          },
        },
        ['responsive', 'hover'] // You can use these modifiers if needed
      );
      //   addComponents({
      //   '.before-overlay:before': {
      //     content: "''",
      //     width: '100%',
      //     background: '#0000002b',
      //     display: 'block',
      //     position: 'absolute',
      //     top: '0',
      //     bottom: '0',
      //     left: '0',
      //     right: '0',
      //     borderRadius: '12px',
      //     zIndex: '0',
      //   },
      // });
    },
    function ({ addComponents }) {
      addComponents({
        '.glow-purple-top': {
          position: 'absolute',
          left: '-5rem',
          top: '-6rem',
          zIndex: '0',
          height: '150px',
          width: '150px',
          borderRadius: '9999px',
          backgroundImage:
            'linear-gradient(to bottom right, rgba(115, 113, 252, 0.4), #7371FC)',
          opacity: '0',
          filter: 'blur(95px)',
          pointerEvents: 'none' /* prevents blocking clicks */,
        },
        '.dark .glow-purple-top': {
          opacity: '1', // visible in dark mode
        },
        '.glow-purple-bottom': {
          position: 'absolute',
          bottom: '-2.5rem', // -bottom-10
          right: '-5rem', // -right-20
          zIndex: '0',
          height: '150px',
          width: '150px',
          borderRadius: '9999px',
          backgroundImage:
            'linear-gradient(to bottom right, rgba(115, 113, 252, 0.4), #7371FC)',
          opacity: '0',
          filter: 'blur(95px)',
          pointerEvents: 'none' /* prevents blocking clicks */,
        },
        '.dark .glow-purple-bottom': {
          opacity: '1', // visible in dark mode
        },
        '.glow-purple-right': {
          position: 'absolute',
          bottom: '-2.5rem' /* like -bottom-10 */,
          right: '-5rem' /* like -right-20 */,
          zIndex: '0',
          height: '90px',
          width: '500px',
          borderRadius: '9999px',
          backgroundImage:
            'linear-gradient(to bottom right, rgba(115, 113, 252, 0.4), #7371fc)',
          opacity: '0',
          filter: 'blur(95px)',
          pointerEvents: 'none' /* prevents blocking clicks */,
        },
        '.dark .glow-purple-right': {
          opacity: '1', // visible in dark mode
        },
      });
    },
  ],
};
