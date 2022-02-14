import messageproto from "./message_pb"
import * as EL from "./elements"

const pbcontrol = new messageproto.PlayerControl()

export function upBuffer(posInstance, vault) {
    if (posInstance instanceof EL.GameLocation && vault instanceof EL.GameVaultCache) {
        posInstance.upcmd()
        let g = posInstance.getPosInfo()
        pbcontrol.setId(vault.getSQLid())
        pbcontrol.setX(g.x)
        pbcontrol.setY(g.y)
        // const buffer = pbcontrol.serializeBinary();
        // console.log(new TextDecoder().decode(buffer));
        // 文字列に変換する
        // メッセージをデコードする
        // const decode = person.Person.deserializeBinary(buffer);
        // console.log(decode);
        // const obj = pbcontrol.toObject();
        // console.log(obj);
        console.log(pbcontrol.toObject())
        return pbcontrol.serializeBinary();
    }
}

export function recBufferMo(posInstance, messageObj) {
    //console.log(pbcontrol, messageObj.Body)
    const playerCon = messageproto.Player.deserializeBinary(messageObj.Body)
    /*    console.log(playerCon.getId())
        console.log(playerCon.getX());
        console.log(playerCon.getY());
        console.log(playerCon.getTiledX());
        console.log(playerCon.getTiledY());*/
    console.log(playerCon.toObject())
    posInstance.updateMoChan(playerCon.toObject())
}
