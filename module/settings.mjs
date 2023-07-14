export const RegisterSettings = function () {
    /* ------------------------------------ */
    /* User settings                        */
    /* ------------------------------------ */
    game.settings.register("mutants-and-masterminds-3e", "typeroll", {
        name: "MM3.SETTING.Typejet",
        hint: "",
        scope: "world",
        config: true,
        default: "1D20",
        type: String,
        choices:{
            "1D20":"MM3.SETTING.Standard1d20",
            "3D20":"MM3.SETTING.Guide3d20",
            "3D6":"MM3.SETTING.3d6",
        }
    });

    game.settings.register("mutants-and-masterminds-3e", "dcroll", {
        name: "MM3.SETTING.DCRoll",
        hint: "MM3.SETTING.DCRollHint",
        scope: "client",
        config: true,
        default: "shift",
        type: String,
        choices:{
            "shift":"MM3.SETTING.ShiftClicgauche",
            "clic":"MM3.SETTING.Clicgauche",
        }
    });
};