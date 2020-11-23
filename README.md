# Phonetones
[![GitHub release](https://img.shields.io/github/release/ernaniaz/phonetones.svg?maxAge=2592000)](https://github.com/ernaniaz/phonetones)
[![GitHub license](https://img.shields.io/github/license/ernaniaz/phonetones.svg)](https://github.com/ernaniaz/phonetones)

This is a simple JavaScript library to generate a telephony audio tones into web browser.

## Usage

You need to instantiate a new object informing the country and tone. You can use 'custom' as country and specify a tone in Sipura/Linksys format.
The library currently has only United States and Brazil tones, but you can easily add your country tones. You can refer to [Asterisk DAHDI zonedata](https://github.com/asterisk/dahdi-tools/blob/master/zonedata.c) file.

## Example

```
var busy = new PhoneTones ( { country: 'us', tone: 'busy'});

$('#busy').on ( 'mouseover', function () { busy.play (); });
$('#busy').on ( 'mouseout', function () { busy.stop (); });
```

This will play an USA busy tone when mouse over element with ID busy on the page.

## License

MIT License.
