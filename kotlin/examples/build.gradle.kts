plugins {
    kotlin("jvm") version "2.2.20"
}

group = "gr.elaevents.buffela"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

kotlin {
    jvmToolchain(17)
}

dependencies {
    implementation("gr.elaevents.buffela:serialization:3.0.0")
    implementation("gr.elaevents.buffela:deserialization:3.0.0")
}