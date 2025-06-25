'use client';

import { useEffect } from 'react';

export function useFixScrollbarJump() {
  useEffect(() => {
    // Verificar que el script ya haya calculado el ancho
    let scrollbarWidth = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--scrollbar-width').replace('px', '')
    ) || 0;

    // Si no se ha calculado, hacerlo aquí
    if (!scrollbarWidth) {
      const scrollDiv = document.createElement('div');
      scrollDiv.style.cssText = 'width:100px;height:100px;overflow:scroll;position:absolute;top:-9999px;visibility:hidden;';
      document.body.appendChild(scrollDiv);
      
      const inner = document.createElement('div');
      inner.style.cssText = 'width:100%;height:100%;';
      scrollDiv.appendChild(inner);
      
      scrollbarWidth = scrollDiv.offsetWidth - inner.offsetWidth;
      document.body.removeChild(scrollDiv);
      
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    }


    // Función para aplicar compensación desde React
    const applyCompensation = () => {
      if (!document.body.hasAttribute('data-react-scroll-compensated')) {
        const currentPadding = parseInt(document.body.style.paddingRight || '0', 10);
        document.body.style.paddingRight = `${Math.max(currentPadding, scrollbarWidth)}px`;
        document.body.setAttribute('data-react-scroll-compensated', 'true');
      }
    };
    
    // Función para remover compensación desde React
    const removeCompensation = () => {
      if (document.body.hasAttribute('data-react-scroll-compensated')) {
        document.body.style.paddingRight = '';
        document.body.removeAttribute('data-react-scroll-compensated');
      }
    };

    // Observer más agresivo desde React
    const aggressiveObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const target = mutation.target as HTMLElement;
          
          if (target === document.body) {
            const hasOverflowHidden = target.style.overflow === 'hidden' || 
                                    target.style.overflow === 'hidden !important' ||
                                    target.style.cssText.includes('overflow: hidden') ||
                                    target.style.cssText.includes('overflow:hidden');
            
            if (hasOverflowHidden) {
              // Aplicar compensación inmediatamente
              setTimeout(applyCompensation, 0);
              // También aplicar después de un pequeño delay por si acaso
              setTimeout(applyCompensation, 10);
            } else {
              setTimeout(removeCompensation, 50);
            }
          }
        }
      });
    });

    aggressiveObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    // Observer adicional para todo el documento
    const documentObserver = new MutationObserver(() => {
      // Verificar periódicamente si hay selects abiertos y el body tiene overflow hidden
      const hasOpenSelects = document.querySelector('[data-radix-select-content]');
      const hasOverflowHidden = document.body.style.overflow === 'hidden';
      
      if (hasOpenSelects && hasOverflowHidden) {
        applyCompensation();
      } else if (!hasOpenSelects && !hasOverflowHidden) {
        removeCompensation();
      }
    });

    documentObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Verificación periódica como fallback
    const intervalCheck = setInterval(() => {
      const hasOverflowHidden = document.body.style.overflow === 'hidden';
      const hasCompensation = document.body.hasAttribute('data-react-scroll-compensated');
      
      if (hasOverflowHidden && !hasCompensation) {
        applyCompensation();
      } else if (!hasOverflowHidden && hasCompensation) {
        removeCompensation();
      }
    }, 100);

    // Cleanup
    return () => {
      aggressiveObserver.disconnect();
      documentObserver.disconnect();
      clearInterval(intervalCheck);
      removeCompensation();
    };
  }, []);
}
