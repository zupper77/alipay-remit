(() => {
  const AppTheme = {
    Light: 'light',
    Dark: 'dark',
    System: 'system',
  };
  const InternalClassName = {
    BrandLogoImg: '_brand-logo-img_24bb',
    BrandLogoTitle: '_brand-logo-title_14f7',
    BackgroundHelper: '_background-helper_ab05',
    BackgroundImage: '_background-image_40ed',
    BackgroundSvg: '_background-svg_b4ca',
    BackgroundSvgLight: '_background-svg-light_42b8',
    BackgroundSvgDark: '_background-svg-dark_6671',
  };
  const BackgroundImageType = {
    Default: 'default',
    Custom: 'custom',
    FollowLight: 'followLight',
  };
  const getLogoRadius = (radius = 'm') => {
    return { none: '0px', s: '4px', m: '8px', l: '9999px' }[radius];
  };
  const PositionMap = {
    topLeft: { x: 'left', y: 'top' },
    topCenter: { x: 'center', y: 'top' },
    topRight: { x: 'right', y: 'top' },
    left: { x: 'left', y: 'center' },
    center: { x: 'center', y: 'center' },
    right: { x: 'right', y: 'center' },
    bottomLeft: { x: 'left', y: 'bottom' },
    bottomCenter: { x: 'center', y: 'bottom' },
    bottomRight: { x: 'right', y: 'bottom' },
  };

  function __setDocsTheme(
    themePrimarySettings,
    logoSettings,
    backgroundImageSettings,
    currentTheme,
  ) {
    const html = document.documentElement;

    html.setAttribute('data-theme', currentTheme);
    const isOldSafari = (() => {
      if (/Safari/i.test(navigator.userAgent) && navigator.userAgent.includes('Version/')) {
        const version = navigator.userAgent.split('Version/')?.[1]?.split(' ')?.[0] ?? '';
        const [major, minor] = version.split('.');
        if (major && minor) {
          const majorNumber = parseInt(major, 10);
          const minorNumber = parseInt(minor, 10);
          if (majorNumber > 18 || (majorNumber === 18 && minorNumber >= 4)) {
            return false;
          }
        }
        return true;
      }
      return false;
    })();
    if (isOldSafari) {
      html.classList.add('old-safari');
    }

    const { accentColor } = themePrimarySettings[currentTheme] ?? {};
    html.setAttribute('data-accent-color', accentColor || 'purple');

    window.__updateThemeElement = () => {
      const logo = logoSettings[currentTheme].icon;
      const radius = getLogoRadius(logoSettings[currentTheme].radius);
      const title = logoSettings[currentTheme].title;
      const background = backgroundImageSettings[currentTheme];
      const finalBackground =
        background.type === BackgroundImageType.FollowLight
          ? backgroundImageSettings.light
          : background;
      const finalTheme =
        background.type === BackgroundImageType.FollowLight ? AppTheme.Light : currentTheme;
      if (logo) {
        const brandLogos = [...document.getElementsByClassName(InternalClassName.BrandLogoImg)];
        brandLogos.forEach((brandLogo) => {
          if ((brandLogo && brandLogo?.src !== logo) || brandLogo?.style.borderRadius !== radius) {
            brandLogo.src = logo;
            brandLogo.style.borderRadius = getLogoRadius(logoSettings[currentTheme].radius);
          }
        });
      }
      const brandTitles = [...document.getElementsByClassName(InternalClassName.BrandLogoTitle)];
      brandTitles.forEach((brandTitle) => {
        brandTitle.textContent = title;
      });
      const backgroundHelper = document.getElementsByClassName(InternalClassName.BackgroundHelper);
      if (backgroundHelper.length > 0) {
        const isCustomCssBgUrl = getComputedStyle(backgroundHelper[0]).backgroundImage !== 'none';
        const showSvgBg =
          !isCustomCssBgUrl &&
          finalBackground.type === BackgroundImageType.Default &&
          finalBackground.backgroundImage !== 'default';
        const backgroundImage = document.getElementsByClassName(InternalClassName.BackgroundImage);
        const backgroundSvg = document.getElementsByClassName(InternalClassName.BackgroundSvg);
        if (backgroundImage.length > 0) {
          backgroundImage[0].style.display = showSvgBg ? 'none' : 'block';
          const isCustom = finalBackground.type === BackgroundImageType.Custom && !isCustomCssBgUrl;
          backgroundImage[0].style.opacity = isCustom ? (finalBackground?.opacity ?? 100) / 100 : 1;
          backgroundImage[0].style.position = isCustom
            ? finalBackground?.fixed === 'fixed'
              ? 'fixed'
              : 'absolute'
            : '';
          backgroundImage[0].style.setProperty(
            '--custom-background-size',
            isCustom
              ? finalBackground?.size === 'stretch'
                ? '100% 100%'
                : finalBackground?.size === 'tile'
                  ? `${finalBackground?.imageWidth}px ${finalBackground?.imageHeight}px`
                  : finalBackground?.size || '100% auto'
              : '',
          );
          backgroundImage[0].style.setProperty(
            '--custom-background-repeat',
            isCustom ? (finalBackground?.size === 'tile' ? 'repeat' : 'no-repeat') : '',
          );
          backgroundImage[0].style.setProperty(
            '--custom-background-position',
            isCustom
              ? `${PositionMap[finalBackground?.position ?? 'topLeft']?.x} ${PositionMap[finalBackground?.position ?? 'topLeft']?.y}`
              : '',
          );
        }
        if (backgroundSvg.length > 0) {
          backgroundSvg[0].style.display = showSvgBg ? 'block' : 'none';
        }
      }
      const backgroundSvgLight = document.getElementsByClassName(
        InternalClassName.BackgroundSvgLight,
      );
      const backgroundSvgDark = document.getElementsByClassName(
        InternalClassName.BackgroundSvgDark,
      );
      if (backgroundSvgLight.length > 0) {
        backgroundSvgLight[0].style.display = finalTheme === AppTheme.Light ? 'block' : 'none';
      }
      if (backgroundSvgDark.length > 0) {
        backgroundSvgDark[0].style.display = finalTheme === AppTheme.Dark ? 'block' : 'none';
      }
    };
    window.__updateThemeElement();

    window.__currentTheme = currentTheme;
  }
  window.__setDocsTheme = __setDocsTheme;

  let isAddEventListener = false;
  let isResetDocsTheme = false;
  function __prepareDocsConfigScript(config = {}) {
    const LocalStorageKey = {
      get OnlineTheme() {
        return `onlineShare.theme.${config.id || '0'}`;
      },
      get UserTheme() {
        return `user.theme.${config.id || '0'}`;
      },
    };
    if (!config || typeof config !== 'object') {
      return;
    }
    window.__subdirectory = config.subdirectory;
    const theme = config.theme || AppTheme.System;

    const localOnlineTheme = (() => {
      const localStorageTheme = localStorage.getItem(LocalStorageKey.OnlineTheme);
      if (localStorageTheme && Object.values(AppTheme).includes(localStorageTheme)) {
        return localStorageTheme;
      }
      return AppTheme.System;
    })();
    const localUserTheme = (() => {
      const localStorageTheme = localStorage.getItem(LocalStorageKey.UserTheme);
      if (
        localStorageTheme &&
        localStorageTheme !== AppTheme.System &&
        Object.values(AppTheme).includes(localStorageTheme)
      ) {
        return localStorageTheme;
      }
      return undefined;
    })();

    const currentTheme = (() => {
      if (localOnlineTheme === theme && localUserTheme) {
        return localUserTheme;
      }

      if (theme === AppTheme.System) {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        return media.matches ? AppTheme.Dark : AppTheme.Light;
      } else {
        return theme;
      }
    })();

    __setDocsTheme(
      config.themePrimarySettings,
      config.logoSettings,
      config.backgroundImageSettings,
      currentTheme,
    );

    if (!isAddEventListener) {
      isAddEventListener = true;
      window.addEventListener('error', (e) => {
        if (
          e.message.startsWith('Uncaught Error: Minified React error #418;') ||
          e.message.startsWith('Uncaught Error: Minified React error #423;')
        ) {
          if (!isResetDocsTheme) {
            isResetDocsTheme = true;
            __setDocsTheme(
              config.themePrimarySettings,
              config.logoSettings,
              config.backgroundImageSettings,
              currentTheme,
            );

            const iconLink = document.head.querySelector('link[rel="icon"]');
            if (iconLink) {
              const iconLinkHref = iconLink.getAttribute('href');
              if (typeof iconLinkHref === 'string') {
                iconLink.setAttribute('href', iconLinkHref);
              }
            }
          }
        }
      });
    }
  }
  window.__prepareDocsConfigScript = __prepareDocsConfigScript;
})();
