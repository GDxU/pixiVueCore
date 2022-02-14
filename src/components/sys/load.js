import Assets from "@/components/sys/assets.json";
import {___assetList} from "@/components/sys/load_asset";
import _ from "lodash";

function ____animation_char(res) {
    let list_res_items = [];
    _.each(res, function (item, i) {

        let start = i.indexOf("char_");
        let isImg = i.indexOf("_image") > -1;
        let isChar = start > -1;

        if (isChar && !isImg) {
            let short = i.substring(5, 8);
            //  console.log (item, short);
            list_res_items.push({
                name: i,
                k: short,
                t: item.textures
            })
        }
    });
    //console.log (list_res_items);
    return list_res_items
}

function ___path_item(res) {
    //let list_res = [];
    const roadblock = res.roadblock.texture;
    const ambulance_ani = res.ambulance.textures;
    const card_ani = res.card.textures;
    return [{
        name: "BLOCK",
        k: "rb",
        t: roadblock
    }, {
        name: "CARD",
        k: "cr",
        t: card_ani
    }, {
        name: "AMBULANCE",
        k: "am",
        t: ambulance_ani
    }];
}

export default {
    methods: {
        assetList(res) {
            return ___assetList(res);
        },
        assetCharactors(res) {
            return ____animation_char(res);
        },
        assetPathItems(res) {
            return ___path_item(res)
        }
    },
    data() {
        return {
            loaded_asset_list: Assets
        }
    },
};
