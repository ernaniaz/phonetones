/*!
 * JavaScript Telephone Progress Tone Generator v1.0
 * https://github.com/ernaniaz/phonetones/
 *
 * Released under the MIT license
 * https://opensource.org/licenses/MIT
 *
 * Date: Jul/17/2020
 */

( function ( window)
{
  'use strict';

  var PhoneTones = function ( settings)
  {
    // Default settings
    settings = settings || {};
    settings.timelimit = settings.timelimit || 0;
    settings.country = settings.country || 'us';
    settings.tone = settings.tone || 'busy';

    // Tone database
    var tones = {
      us:
      {
        dial: '350+440',
        busy: '480+620/500,0/500',
        ring: '440+480/2000,0/4000',
        congestion: '480+620/250,0/250',
        callwaiting: '440/300,0/10000',
        dialrecall: '!350+440/100,!0/100,!350+440/100,!0/100,!350+440/100,!0/100,350+440',
        record: '1400/500,0/15000',
        info: '!950/330,!1400/330,!1800/330,0',
        stutter: '!350+440/100,!0/100,!350+440/100,!0/100,!350+440/100,!0/100,!350+440/100,!0/100,!350+440/100,!0/100,!350+440/100,!0/100,350+440'
      },
      uk:
      {
        dial: '350+440',
        specialdial: '350+440/750,440/750',
        busy: '400/375,0/375',
        congestion: '400/400,0/350,400/225,0/525',
        specialcongestion: '400/200,1004/300',
        unobtainable: '400',
        ring: '400+450/400,0/200,400+450/400,0/2000',
        callwaiting: '400/100,0/4000',
        specialcallwaiting: '400/250,0/250,400/250,0/250,400/250,0/5000',
        creditexpired: '400/125,0/125',
        confirm: '1400',
        switching: '400/200,0/400,400/2000,0/400',
        info: '950/330,0/15,1400/330,0/15,1800/330,0/1000',
        record: '1400/500,0/60000',
        stutter: '350+440/750,440/750'
      },
      br:
      {
        dial: '425',
        busy: '425/250,0/250',
        ring: '425/1000,0/4000',
        congestion: '425/250,0/250,425/750,0/250',
        callwaiting: '425/50,0/1000',
        dialrecall: '350+440',
        record: '425/250,0/250',
        info: '!950/330,!1400/330,!1800/330,!0/330,!950/330,!1400/330,!1800/330,!0/330,!950/330,!1400/330,!1800/330,0',
        stutter: '350+440'
      },
      pt:
      {
        dial: '425',
        busy: '425/500,0/500',
        ring: '425/1000,0/5000',
        congestion: '425/200,0/200',
        callwaiting: '440/300,0/10000',
        dialrecall: '425/1000,0/200',
        record: '1400/500,0/15000',
        info: '950/330,1400/330,1800/330,0/1000',
        stutter: '!425/100,!0/100,!425/100,!0/100,!425/100,!0/100,!425/100,!0/100,!425/100,!0/100,!425/100,!0/100,425'
      }
    };

    // Basic health check
    if ( ! settings.hasOwnProperty ( 'custom'))
    {
      if ( ! tones.hasOwnProperty ( settings.country))
      {
        throw 'No country \'' + settings.country + '\' tone database found.';
        return null;
      }
      if ( ! tones[settings.country].hasOwnProperty ( settings.tone))
      {
        throw 'No such tone \'' + settings.tone + '\' to country \'' + settings.country + '\'.';
        return null;
      }
      var tonetoplay = tones[settings.country][settings.tone];
    } else {
      if ( ! /^((^|,)(!)?\d+((\+|\*)\d+)?(\/\d+)?)+$/gm.exec ( settings.custom))
      {
        throw 'Custom progress tone \'' + settings.custom + '\' are not valid!.';
        return null;
      }
      var tonetoplay = settings.custom;
    }

    // Initial audio setup
    var context = new ( window.AudioContext || window.webkitAudioContext || window.mozAudioContext) ();
    var gainNode = context.createGain ();
    gainNode.gain.value = 0.25;
    var filter = context.createBiquadFilter ();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime ( 8000, context.currentTime);
    var oscillator1 = null;
    var oscillator2 = null;
    var playing = false;
    var clonetone = '';
    var tone = '';
    var timeout = null;
    var playnext = null;

    // Start playing tones method
    var start = function ()
    {
      if ( settings.timelimit != 0)
      {
        timeout = setTimeout ( function () { stop (); }, settings.timelimit);
      }
      playing = true;
      clonetone = tonetoplay;
      playtone ();
    };

    // Play tone function
    var playtone = function ()
    {
      // If it's not playing (stopped), exit
      if ( ! playing)
      {
        return;
      }

      // If first time playing or reached tone end, start again
      if ( tone == '')
      {
        if ( clonetone == '')
        {
          stop ();
          return;
        }
        tone = clonetone;
      }

      // Get first tone(s)
      if ( tone.indexOf ( ',') != -1)
      {
        var play = tone.substring ( 0, tone.indexOf ( ','));
        tone = tone.substr ( tone.indexOf ( ',') + 1);
      } else {
        var play = tone;
        tone = '';
      }
      if ( play.substr ( 0, 1) == '!')
      {
        play = play.substr ( 1);
        clonetone.replace ( /\![0-9+\*]+(\/[0-9]+)?(,|$)/, '');
      }
      if ( play.indexOf ( '/') != -1)
      {
        var currenttone = play.substring ( 0, play.indexOf ( '/'));
        var duration = play.substring ( play.indexOf ( '/') + 1);
      } else {
        var currenttone = play;
        var duration = 0;
      }

      // Stop current tone if playing
      if ( oscillator1 !== null)
      {
        oscillator1.stop ( 0);
        oscillator1 = null;
      }
      if ( oscillator2 !== null)
      {
        oscillator2.stop ( 0);
        oscillator2 = null;
      }

      // Play tone(s)
      oscillator1 = context.createOscillator ();
      if ( currenttone.indexOf ( '+') != -1)
      {
        oscillator1.frequency.value = currenttone.substring ( 0, currenttone.indexOf ( '+'));
        oscillator2 = context.createOscillator ();
        oscillator2.frequency.value = currenttone.substring ( currenttone.indexOf ( '+') + 1);
      } else {
        oscillator1.frequency.value = currenttone;
      }

      oscillator1.connect ( gainNode);
      if ( currenttone.indexOf ( '+') != -1)
      {
        oscillator2.connect ( gainNode);
      }

      gainNode.connect ( filter);
      filter.connect ( context.destination);

      oscillator1.start ( 0);
      if ( currenttone.indexOf ( '+') != -1)
      {
        oscillator2.start ( 0);
      }

      if ( duration)
      {
        playnext = setTimeout ( playtone, duration);
      }
    };

    // Stop playing tones method
    var stop = function ()
    {
      playing = false;
      if ( timeout)
      {
        clearTimeout ( timeout);
      }
      if ( playnext)
      {
        clearTimeout ( playnext);
      }
      if ( oscillator1 !== null)
      {
        oscillator1.stop ( 0);
        oscillator1 = null;
      }
      if ( oscillator2 !== null)
      {
        oscillator2.stop ( 0);
        oscillator2 = null;
      }
    };

    // Public API
    this.country = settings.country;
    this.tone = settings.tone;
    this.start = start;
    this.stop = stop;
  };

  // We need that our library is globally accesible, then we save in the window
  if ( typeof ( window.PhoneTones) === 'undefined')
  {
    window.PhoneTones = PhoneTones;
  }
}) ( window);
