package gr.elaevents.buffela.examples

import gr.elaevents.buffela.examples.authToken.AuthTokenPayload
import gr.elaevents.buffela.examples.authToken.Date
import gr.elaevents.buffela.examples.authToken.Gender
import gr.elaevents.buffela.examples.authToken.User

val payload: AuthTokenPayload = AuthTokenPayload(
    issuedAt = System.currentTimeMillis().toDouble(),
    user = User.Registered.Viewer(
        userId = "588809b0-d8ce-4a6b-a2aa-9b10fd9d7a11",
        verified = true,
        birthDate = Date(
            year = 2003,
            month = 7,
            day = 22
        ),
        countryCode = 30u,
        phone = "1234567890",
        gender = Gender.MALE
    )
)