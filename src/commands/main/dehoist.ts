import { Message, GuildMember } from "discord.js"
import Bot from '../../bot'
import dehoist from "../../services/dehoist"

export const help = {
    name: "dehoist",
    permission: "MANAGE_NICKNAMES"
}

export async function execute (response: Message, args: Array<string>) {
    let currentMember: GuildMember = response.member

    if (currentMember.permissions.has("MANAGE_NICKNAMES")) {
        let reply: Message = await response.channel.send("Manually dehoisting members, this may take a while depending on how big your server is...")

        try 
        {
            await (function() {
                for (let [id, member] of response.guild.members.cache) {
                    if (member.manageable)
                    member.setNickname(dehoist(member.nickname || member.user.username))
                }
            })()

            reply.edit("**SUCCESS**: All editable members have been filtered.")
        }
        catch 
        {
            reply.edit("**ERROR**: An unexpected error occured. This could be because of permission failure. Make sure I have the `MANAGE_NICKNAMES` permission.")
        }
    }
}