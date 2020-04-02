import btcLogo from '../../public/images/icons/btc.svg';
import rvnLogo from '../../public/images/icons/rvn.svg';
import rvnLogoAlt from '../../public/images/icons/rvnAlt.svg';
import floLogo from '../../public/images/icons/flo.svg';


export const crypto = {
    bitcoin: {
        name: 'bitcoin',
        code: "BTC",
        icon: btcLogo
    },
    flo: {
        name: 'flo',
        code: "FLO",
        icon: floLogo
    }, 
    raven: {
        name: 'raven',
        code: "RVN",
        icon: rvnLogo,
        altIcon: rvnLogoAlt
    },
}