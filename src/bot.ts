import { Client, Collection, Message, GuildMember } from 'discord.js'
import { readdir } from 'fs'
import * as dotenv from 'dotenv'
import config from './config'
import dehoist from './services/dehoist'

const commandModules = config.modules

interface commandFile extends File {
    help: {
        name: String,
        permission: String
    },
    execute: Function
}

class Bot {
    public client: Client
    public commands: Collection<string, File>
    public aliases: Collection<string, File>

    constructor() {
        this.client = new Client()
        this.commands = new Collection()
        this.aliases = new Collection()
        dotenv.config()
    }

    public Start(): void {
        this.client.on('ready', this.onReady.bind(this))
        this.client.on('message', this.onMessage.bind(this))
        this.client.on('guildMemberAdd', this.onMemberAdd.bind(this))
        dotenv.config()
        this.client.login(process.env.CLIENT_TOKEN)
    }

    private loadCommands(): void {
        let self = this

        commandModules.forEach(c => {
            readdir(`./src/bot/commands/${c}/`, (err: Error, files: Array<any>) => {
                if (err) throw err
                console.log(`[Commands] Loaded ${files.length} commands of module ${c}`)

                files.forEach(f => {
                    const props = require(`./commands/${c}/${f}`).default
                    self.commands.set(props.help.name, props)
                    if (props.settings.aliases !== undefined) {
                        props.settings.aliases.forEach(alias => {
                            self.aliases.set(alias, props)
                        })
                    }
                })
            })
        })
    }

    private onReady(): void {
        console.log(`Client has now logged into Discord as ${this.client.user.tag}.`)
        this.loadCommands()
    }

    private onMemberAdd(member: GuildMember): void {
        member.setNickname(dehoist(member.nickname || member.user.username))
    }

    private onMessage(response: Message): void {
        if (response.author.bot) return

        const content: string = response.content
        const prefix: RegExpMatchArray = content.match(config.prefix)

        if (!prefix) return

        let args: Array<string> = content.slice(prefix[0].length).trim().split(/ +/g)
        let command: string = args.shift().toLowerCase()

        const isDeveloper = (): boolean => {
            return ["258706134850863106"].includes(response.author.id)
        }

        const executeCommand = (commandFile: commandFile) => {
            if (
                isDeveloper() == false &&
                commandFile.help.permission == "developer"
            )
                return
            commandFile.execute(response, args)
        }

        if (this.commands.get(command)) executeCommand(this.commands.get(command) as commandFile)
        if (this.aliases.get(command)) executeCommand(this.aliases.get(command) as commandFile)
    }
}

let bot: Bot = new Bot()
bot.Start()

export default bot