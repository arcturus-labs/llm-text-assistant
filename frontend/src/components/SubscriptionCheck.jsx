import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import Cookies from 'js-cookie';
import './SubscriptionCheck.css';
// TODO! make the email for verification john@arcturus-labs.com
// TODO! make the redirect for verification https://arcturus-labs.com/verify
const COOKIE_PREFIX = 'subscription_';
const COOKIE_EMAIL = `${COOKIE_PREFIX}email`;
const COOKIE_AUTH = `${COOKIE_PREFIX}authorized`;
const COOKIE_OPTIONS = { expires: 365, sameSite: 'strict' }; // Cookies last 1 year

const SubscriptionCheck = forwardRef((props, ref) => {
  const [showModal, setShowModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [authorized, setAuthorized] = useState(false);

  // Check cookies on mount
  useEffect(() => {
    const savedEmail = Cookies.get(COOKIE_EMAIL);
    const savedAuth = Cookies.get(COOKIE_AUTH) === 'true';

    if (savedEmail) {
      setEmail(savedEmail);
    }
    
    if (savedAuth) {
      setAuthorized(true);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    checkSubscription: () => {
      if (!authorized) {
        setShowModal(true);
        return false;
      }
      return true;
    }
  }));

  const handleVerification = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/verify_subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.subscribed) {
        Cookies.set(COOKIE_EMAIL, email, COOKIE_OPTIONS);
        Cookies.set(COOKIE_AUTH, 'true', COOKIE_OPTIONS);
        
        setAuthorized(true);
        setShowModal(false);
      } else {
        Cookies.set(COOKIE_EMAIL, email, COOKIE_OPTIONS);
        setError(result.error || 'Subscription not found. Please check your email for verification instructions.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="subscription-modal-overlay">
      <div className="subscription-modal">
        <h2>Subscription Required</h2>
        <p>
          This demo is available exclusively to Arcturus Labs subscribers. 
          Please enter your email to verify your subscription or subscribe.
        </p>
        <form onSubmit={handleVerification}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          <button type="submit" disabled={isVerifying}>
            {isVerifying ? 'Verifying...' : 'Verify or Subscribe'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
});

export default SubscriptionCheck; 