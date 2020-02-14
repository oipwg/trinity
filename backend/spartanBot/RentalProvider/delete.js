module.exports = function(vorpal, options) {
    let spartan = options.SpartanBot

    vorpal
        .command('rentalprovider delete')
        .description('Selection of a rental provider that you wish to remove')
        .alias('rp delete')
        .action(async function(args) {
            let rental_providers = spartan.getRentalProviders()

            if (rental_providers.length === 0) {
                return this.log(
                    vorpal.chalk.yellow(
                        "No Rental Providers were found! Please run '"
                    ) +
                        vorpal.chalk.cyan('rentalprovider add') +
                        vorpal.chalk.yellow("' to add your API keys.")
                )
            }

            let provider_choices = []
            let uid_map = {}

            for (let provider of rental_providers) {
                let serialized_provider = provider.serialize()

                let provider_string =
                    'Type: ' +
                    serialized_provider.type +
                    ' | API Key: ' +
                    serialized_provider.api_key
                provider_choices.push(provider_string)
                uid_map[provider_string] = serialized_provider.uid
            }

            let select_provider_answers = await this.prompt({
                type: 'list',
                name: 'rental_provider',
                message: vorpal.chalk.yellow(
                    'Which Rental Provider do you wish to Delete?'
                ),
                choices: provider_choices,
            })

            let rental_provider_to_delete =
                select_provider_answers.rental_provider

            let confirm_answer = await this.prompt({
                type: 'confirm',
                name: 'confirm',
                message: vorpal.chalk.red(
                    'Are you sure you wish to delete `' +
                        rental_provider_to_delete +
                        '`?'
                ),
                default: true,
            })

            if (confirm_answer.confirm) {
                let delete_success = spartan.deleteRentalProvider(
                    uid_map[rental_provider_to_delete]
                )

                if (delete_success) {
                    if (spartan.getRentalProviders().length === 0)
                        spartan.pools = []
                    this.log(
                        vorpal.chalk.green(
                            'Successfully deleted `' +
                                rental_provider_to_delete +
                                '`!'
                        )
                    )
                } else {
                    this.log(
                        vorpal.chalk.red(
                            'Error! Unable to delete Rental Provider!'
                        )
                    )
                }
            } else {
                this.log(vorpal.chalk.red('Rental Provider delete cancelled'))
            }
        })
}
