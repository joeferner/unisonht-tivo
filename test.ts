import {UnisonHT} from "unisonht";
import {Tivo} from ".";

const unisonht = new UnisonHT();

unisonht.use(new Tivo('tivo', {address: '192.168.0.60'}));

unisonht.listen(3000);
