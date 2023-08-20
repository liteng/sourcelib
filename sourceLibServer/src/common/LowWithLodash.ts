import { Low } from "lowdb";
import lodash from "lodash";

class LowWithLodash<T> extends Low<T> {
    chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data');
}

export default LowWithLodash;