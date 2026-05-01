'use client'

import { useEffect } from 'react'
import * as CookieConsent from 'vanilla-cookieconsent'

export function CookieBanner() {
  useEffect(() => {
    CookieConsent.run({
      guiOptions: {
        consentModal: {
          layout: 'bar',
          position: 'bottom',
          equalWeightButtons: false,
          flipButtons: false,
        },
        preferencesModal: {
          layout: 'box',
          position: 'right',
        },
      },

      categories: {
        necessary: {
          enabled: true,
          readOnly: true,
        },
        analytics: {
          enabled: false,
          autoClear: {
            cookies: [{ name: /^_ga/ }, { name: '_gid' }, { name: /^ph_/ }],
          },
        },
      },

      language: {
        default: 'en',
        translations: {
          en: {
            consentModal: {
              title: 'We use cookies',
              description:
                'CitizenReady uses essential cookies to keep you logged in and optional analytics cookies to improve the study experience. You can manage your preferences at any time.',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Necessary only',
              showPreferencesBtn: 'Manage preferences',
              footer:
                '<a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms of Service</a>',
            },
            preferencesModal: {
              title: 'Cookie preferences',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Necessary only',
              savePreferencesBtn: 'Save preferences',
              closeIconLabel: 'Close',
              sections: [
                {
                  title: 'Cookie usage',
                  description:
                    'We use cookies to keep you signed in and to understand how users navigate the app. We never sell your data.',
                },
                {
                  title: 'Strictly necessary',
                  description:
                    'Required for authentication and security. These cannot be disabled.',
                  linkedCategory: 'necessary',
                },
                {
                  title: 'Analytics',
                  description:
                    'Help us understand how users use CitizenReady so we can improve the study experience. No personal data is sold or shared with advertisers.',
                  linkedCategory: 'analytics',
                },
                {
                  title: 'More information',
                  description:
                    'For any questions about our cookie policy, please <a href="/contact">contact us</a>.',
                },
              ],
            },
          },
        },
      },
    })
  }, [])

  return null
}
