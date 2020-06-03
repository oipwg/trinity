module.exports = function(options) {
    let spartan = options.SpartanBot;
    async function() {
            let rental_providers = spartan.getRentalProviders()

            if (rental_providers.length === 0) {
                
                return console.log(
                        "No Rental Providers were found! Please run '"
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
                console.log(provider_string)
    }
}
