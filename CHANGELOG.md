# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!-- SIMSALA --> <!-- DON'T DELETE, used for automatic changelog updates -->

## [0.2.3] - 2019-12-18

### Fixed

- [#24](https://github.com/cosmos/lunie/pull/24) Fix 'window is undefined' bug for UMD @colw

## [0.2.2] - 2019-11-15

### Fixed

- Fix api.get.tx(hash) not working because of an unhandled response format @faboweb

## [0.2.1] - 2019-08-23

### Changed

- Updated to support newest SDK version @faboweb

## [0.1.3] - 2019-08-06

### Added

- Added collective validatorSigningInfos endpoint @faboweb

## [0.1.2] - 2019-08-01

### Added

- Added minting endpoints @faboweb

## [0.1.1] - 2019-07-10

### Added

- Export some lower level api calls to make it easier to integrate into other libs @faboweb
- Return included transaction @faboweb

### Repository

- Made repo CI ready @faboweb

## [0.0.23] - 2019-06-15

### Changed

- Renamed module to cosmos-api @faboweb

### Fixed

- Fixed depositing message @faboweb

## [0.0.22] - 2019-06-05

### Security

- Updated axios @faboweb

## [0.0.21] - 2019-05-24

### Fixed

- Fixed not all validators being loaded @faboweb

## [0.0.20] - 2019-05-23

### Fixed

- Fixed inclusion check @faboweb

## [0.0.19] - 2019-05-22

### Fixed

- Fix inclusion check @faboweb

## [0.0.18] - 2019-05-22

### Added

- Check for errors on already broadcased transactions @faboweb

## [0.0.17] - 2019-05-22

### Changed

- Increase gas adjustment to 1.5 @faboweb

## [0.0.16] - 2019-05-21

### Fixed

- Fixed premature success message on tx inclusion failure @faboweb

## [0.0.15] - 2019-05-21

### Added

- Added simsala release tool @faboweb

### Changed

- Increase simulated gas by a factor of 1.2 as a recommendation of the SDK team @faboweb

### Fixed

- Properly handle synchronous signers @faboweb