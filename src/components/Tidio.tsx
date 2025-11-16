import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const TidioChat = () => {
  const location = useLocation();

  // Pages where Tidio should be visible
  const allowedPages = [
    '/',           // Homepage
    '/dashboard',  // User Dashboard
    '/dashboard/investments',
    '/dashboard/plans',
    '/dashboard/withdraw',
    '/dashboard/deposit',
    '/dashboard/wallets'
  ];

  // Pages where Tidio should NOT be visible
  const blockedPages = [
    '/login',
    '/signup',
    '/privacy-policy',
    '/terms',
    '/admin',
    '/admin/dashboard',
    '/admin/analytics',
    '/admin/notifications',
    '/admin/settings',
    '/admin/users',
    '/not-found'
  ];

  const currentPath = location.pathname;
  
  // Check if current path is blocked
  const isBlocked = blockedPages.some(page => currentPath.startsWith(page));
  
  // Check if current path is allowed (if not explicitly blocked)
  const isAllowed = !isBlocked && (
    allowedPages.some(page => currentPath.startsWith(page)) ||
    currentPath === '/'
  );

  useEffect(() => {
    if (!isAllowed) {
      // Hide Tidio if it exists
      const tidioDiv = document.getElementById('tidio-chat');
      if (tidioDiv) {
        tidioDiv.style.display = 'none';
      }
      
      // Remove Tidio script if it was loaded
      const tidioScript = document.querySelector('script[src*="tidio"]');
      if (tidioScript) {
        tidioScript.remove();
      }
      return;
    }

    // Load Tidio chat widget for allowed pages
    const loadTidio = () => {
      if (window.tidioChatApi) {
        window.tidioChatApi.display('show');
      } else {
        // Initialize Tidio chat
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.id = 'tidio-chat-script';
        // Replace with actual Tidio API key
        script.src = 'https://api.tidiochat.com/v1/chat/{YOUR_TIDIO_KEY}.js';
        document.body.appendChild(script);
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(loadTidio, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [location.pathname, isAllowed]);

  // Don't render anything, Tidio loads via script tag
  return null;
};

export default TidioChat;
