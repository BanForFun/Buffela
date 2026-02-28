import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.androidKmpLibrary)
    alias(libs.plugins.mavenPublish)
}

group = libs.versions.lib.group.get()
version = libs.versions.lib.version.get()

kotlin {
    jvm()
    androidLibrary {
        namespace = "gr.elaevents.buffela.serialization"
        compileSdk = libs.versions.android.compileSdk.get().toInt()
        minSdk = libs.versions.android.minSdk.get().toInt()

        withJava()

        compilerOptions {
            jvmTarget.set(JvmTarget.JVM_11)
        }
    }
    iosX64()
    iosArm64()
    iosSimulatorArm64()
    linuxX64()

    sourceSets {
        commonMain.dependencies {
            implementation(libs.kotlinx.io)
        }

        commonTest.dependencies {
            implementation(libs.kotlin.test)
        }
    }
}

mavenPublishing {
    publishToMavenCentral()

    signAllPublications()

    coordinates(group.toString(), "serialization", version.toString())

    pom {
        name = "Buffela serialization utilities"
        description = "Utilities for buffela schema serialization"
        inceptionYear = "2026"
        url = "https://github.com/BanForFun/Buffela/tree/master"
        licenses {
            license {
                name = "MIT License"
                url = "https://opensource.org/license/mit"
                distribution = "https://opensource.org/license/mit"
            }
        }
        developers {
            developer {
                id = "banforfun"
                name = "BanForFun"
                url = "https://github.com/BanForFun"
            }
        }
        scm {
            url = "https://github.com/BanForFun/Buffela"
            connection = "scm:git:git://github.com:BanForFun/Buffela.git"
            developerConnection = "scm:git:ssh://git@github.com:BanForFun/Buffela.git"
        }
    }
}