# Build
```
( cd "$(git rev-parse --show-toplevel)/apps/documize/.pipeline" && npm run build -- --pr=0 --dev-mode=true )
```
Where:
`--pr=0` is used to set the pull request number to build from.
`--dev-mode=true` is used to indicate that the build will actually take the files in the current working directory, as opposed to a fresh `git clone`

# Deploy to DEV
```
( cd "$(git rev-parse --show-toplevel)/apps/documize/.pipeline" && npm run deploy -- --pr=0 --env=dev )
```

# Deploy to PROD
```
( cd "$(git rev-parse --show-toplevel)/apps/documize/.pipeline" && npm run deploy -- --pr=0 --env=prod )
```

# Clean
The clean script can run against each persistent environment, starting from `build`.
```
( cd "$(git rev-parse --show-toplevel)/apps/documize/.pipeline" && npm run clean -- --pr=0 --env=build )
( cd "$(git rev-parse --show-toplevel)/apps/documize/.pipeline" && npm run clean -- --pr=0 --env=dev )
```

*Warning*: Do *NOT* run against `test` or `prod`. It will cause *PERMANENT* deletion of all objects including `PVC`! be warned!
