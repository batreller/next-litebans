import { db } from "../db";
import {getWarnCount} from "@/lib/punishment/warn";
import {getKickCount} from "@/lib/punishment/kick";
import {getMuteCount} from "@/lib/punishment/mute";
import {getBanCount} from "@/lib/punishment/ban";

const getPlayerByName = async (name: string) => {
  const player = await db.litebans_history.findFirst({
    where: {
      name
    },
    orderBy: {
      date: 'desc'
    },
    select: {
      uuid: true,
      name: true
    }
  });

  return player;
}

const getPlayerBanCount = async (uuid: string) => {
    return await getBanCount(uuid);
}

const getPlayerMuteCount = async (uuid: string) => {
    return await getMuteCount(uuid);
}

const getPlayerWarnCount = async (uuid: string) => {
    return await getWarnCount(uuid);
}

const getPlayerKickCount = async (uuid: string) => {
    return await getKickCount(uuid);
}

export { getPlayerByName, getPlayerBanCount, getPlayerMuteCount, getPlayerWarnCount, getPlayerKickCount}