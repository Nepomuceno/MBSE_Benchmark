# SysML v2 Model Attribution

## License

The SysML v2 models in `source/` are from the GfSE SysML-v2-Models repository
and are provided under the BSD 3-Clause License.

## Source

### GfSE SysML-v2-Models Repository

- URL: <https://github.com/GfSE/SysML-v2-Models>
- License: BSD 3-Clause License
- Copyright (c) 2024, Gesellschaft für Systems Engineering e.V.

## BSD 3-Clause License

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

## Source Models Included

All models from `models/SE_Models/` that pass the official monticore SysML v2 parser:

- `Drone_BaseArchitecture.sysml` - Drone base architecture
- `Fischertechnik.sysml` - Factory/manufacturing system
- `ForestFireDetectionSystemModel.sysml` - Detection system
- `ForestFireObservationDrone.sysml` - Observation drone (has import warnings)
- `HVACSystemRequirements.sysml` - HVAC requirements (has import warnings)
- `InternetModel_v1.sysml` - Internet model (has import warnings)
- `lawnmowerPackage.sysml` - Lawnmower system
- `Metamodel.sysml` - Metamodel/datatypes (has import warnings)
- `StopWatchStates.sysml` - State machine example

Note: Import warnings are due to missing standard library, not syntax errors.

## Invalid Models

The models in `invalid/` are intentionally malformed versions of the source models,
created for validation testing. They are derived works and contain:

- Syntax errors (missing braces, invalid keywords)
- Semantic errors (undefined references)
- Structural errors (malformed expressions)

These models should NOT be used as examples of valid SysML v2.
