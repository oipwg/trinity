module.exports = function(options) {
    let spartan = options.SpartanBot

  
            let rental_providers = spartan.getRentalProviders()

            if (rental_providers.length === 0) {
   
                    console.log("No Rental Providers were found! Please run '") 
                
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
                message: console.log(
                    'Which Rental Provider do you wish to Delete?'
                ),
                choices: provider_choices,
            })

            let rental_provider_to_delete =
                select_provider_answers.rental_provider

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
                    console.log('Error! Unable to delete Rental Provider!')
                }
            
        })
}
