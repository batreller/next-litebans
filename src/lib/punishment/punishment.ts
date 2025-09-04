import { Prisma } from "@prisma/client";
import { siteConfig } from "@config/site";
import { PunishmentListItem } from "@/types";

import { db } from "../db";
import { Dictionary } from "../language/types";

const getPunishmentCount = async (player?: string, staff?: string) => {
  const bans = await db.litebans_bans.count({
    where: {
      uuid: player,
      banned_by_uuid: staff
    }
  });
  const mutes = await db.litebans_mutes.count({
    where: {
      uuid: player,
      banned_by_uuid: staff
    }
  });
  const warns = await db.litebans_warnings.count({
    where: {
      uuid: player,
      banned_by_uuid: staff
    }
  });
  const kicks = await db.litebans_kicks.count({
    where: {
      uuid: player,
      banned_by_uuid: staff
    }
  });

  return { bans, mutes, warns, kicks }
}

const getPlayerName = async (uuid: string) => {
  const player = await db.litebans_history.findFirst({
    where: {
      uuid
    },
    orderBy: {
      date: 'desc'
    },
    select: {
      name: true
    }
  });

  return player?.name;
}

const getPunishments = async (page: number, player?: string, staff?: string) => {
    const pageSize = 10;
    const offset = (page - 1) * pageSize;
    const subqueryLimit = offset + pageSize;

    const query = Prisma.sql`
    SELECT * FROM (
      SELECT * FROM (
        SELECT id, uuid, banned_by_name, banned_by_uuid, reason, time, until, active, 'ban' AS type
        FROM litebans_bans
        WHERE 1=1
          ${player ? Prisma.sql`AND uuid = ${player}` : Prisma.sql``}
          ${staff ? Prisma.sql`AND banned_by_uuid = ${staff}` : Prisma.sql``}
        ORDER BY time DESC
          LIMIT ${subqueryLimit}
      ) bans
      UNION ALL
      SELECT * FROM (
        SELECT id, uuid, banned_by_name, banned_by_uuid, reason, time, until, active, 'mute' AS type
        FROM litebans_mutes
        WHERE 1=1
          ${player ? Prisma.sql`AND uuid = ${player}` : Prisma.sql``}
          ${staff ? Prisma.sql`AND banned_by_uuid = ${staff}` : Prisma.sql``}
        ORDER BY time DESC
          LIMIT ${subqueryLimit}
      ) mutes
      UNION ALL
      SELECT * FROM (
        SELECT id, uuid, banned_by_name, banned_by_uuid, reason, time, until, active, 'warn' AS type
        FROM litebans_warnings
        WHERE 1=1
          ${player ? Prisma.sql`AND uuid = ${player}` : Prisma.sql``}
          ${staff ? Prisma.sql`AND banned_by_uuid = ${staff}` : Prisma.sql``}
        ORDER BY time DESC
          LIMIT ${subqueryLimit}
      ) warns
      UNION ALL
      SELECT * FROM (
        SELECT id, uuid, banned_by_name, banned_by_uuid, reason, time, until, active, 'kick' AS type
        FROM litebans_kicks
        WHERE 1=1
          ${player ? Prisma.sql`AND uuid = ${player}` : Prisma.sql``}
          ${staff ? Prisma.sql`AND banned_by_uuid = ${staff}` : Prisma.sql``}
        ORDER BY time DESC
          LIMIT ${subqueryLimit}
      ) kicks
      ORDER BY time DESC
        LIMIT ${pageSize}
      OFFSET ${offset}
    ) final_result
  `;

    return await db.$queryRaw(query) as PunishmentListItem[];
}

const sanitizePunishments = async (dictionary: Dictionary, punishments: PunishmentListItem[]) => {
  const sanitized = await Promise.all(punishments.map(async (punishment) => {
    const name = await getPlayerName(punishment.uuid!);
    const until = (punishment.type == "ban" || punishment.type == "mute") ? 
                    punishment.until.toString() === "0" ? 
                    dictionary.table.permanent : 
                    new Date(parseInt(punishment.until.toString())) : 
                  "";
    const status = (punishment.type == "ban" || punishment.type == "mute") ?
                    until == dictionary.table.permanent ? 
                    (punishment.active ? true : false) : 
                    (until < new Date() ? false : undefined) :
                  undefined;
    return {
      ...punishment,
      id: punishment.id.toString(),
      time: new Date(parseInt(punishment.time.toString())),
      console: punishment.banned_by_uuid === siteConfig.console.uuid,
      status,
      until,
      name
    }
  }));

  return sanitized;
}

export { getPunishmentCount, getPlayerName, getPunishments, sanitizePunishments }