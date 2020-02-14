module.exports = function(vorpal, options) {
    let spartan = options.SpartanBot

    vorpal
        .command('rentalprovider list')
        .description('Lists out all rental providers that have been added')
        .alias('rp list')
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

            for (let provider of rental_providers) {
                let serialized_provider = provider.serialize()

                let provider_string =
                    'Type: ' +
                    serialized_provider.type +
                    ' | API Key: ' +
                    serialized_provider.api_key
                provider_choices.push(provider_string)
            }

            for (let provider_string of provider_choices)
                this.log(vorpal.chalk.yellow(provider_string))
        })
}
