/* Coordinated material, furnishing and exterior specifications. Local, editable and shared. */
(() => {
const styles={
 contemporary:{name:'Contemporary',caption:'Mineral planes · tailored furnishings',floor:'oak',wall:'chalk',finish:'mineral',tone:'chalk',wood:0xb4956e,fabric:0x879580,accent:0x374d43,metal:0x354840,art:0xabb599,fins:false,canopy:true,parapet:true,light:'day',feature:'gallery'},
 japandi:{name:'Japandi',caption:'Pale timber · linen · quiet detail',floor:'oak',wall:'chalk',finish:'timber',tone:'chalk',wood:0xc3ab86,fabric:0xd4cbbb,accent:0x776f5d,metal:0x514e43,art:0x9eaa91,fins:true,canopy:true,parapet:false,light:'golden',feature:'slats'},
 tropical:{name:'Tropical modern',caption:'Shaded edges · warm wood · green',floor:'terrazzo',wall:'sage',finish:'timber',tone:'sage',wood:0x987044,fabric:0xb4c092,accent:0x436b51,metal:0x355745,art:0x648c65,fins:true,canopy:true,parapet:true,light:'day',feature:'slats'},
 industrial:{name:'Industrial',caption:'Concrete · graphite · exposed services',floor:'concrete',wall:'chalk',finish:'mineral',tone:'charcoal',wood:0x84674d,fabric:0x716b62,accent:0x313c3b,metal:0x303b3a,art:0x9d795c,fins:false,canopy:true,parapet:true,light:'evening',feature:'gallery'},
 mediterranean:{name:'Mediterranean',caption:'Chalk · clay · soft mineral texture',floor:'terrazzo',wall:'clay',finish:'mineral',tone:'chalk',wood:0xc0a17b,fabric:0xe3d8be,accent:0xb17d60,metal:0x807858,art:0xc99b72,fins:false,canopy:true,parapet:false,light:'golden',feature:'niche'},
 bold:{name:'Urban colour',caption:'Terracotta · dark trim · ochre',floor:'concrete',wall:'clay',finish:'terracotta',tone:'charcoal',wood:0x96704d,fabric:0xb99856,accent:0x334d51,metal:0x293c3c,art:0xb96c53,fins:true,canopy:true,parapet:true,light:'day',feature:'gallery'}
};
const stages=[['existing','01 / Survey','Review the retained asset and confirm dimensions.'],['frame','02 / Prepare','Study the new support layout and the areas being reworked.'],['eps','03 / Envelope','Review EPS panels, actual openings and core quantities.'],['services','04 / Services','Inspect indicative service routes and facade support rails.'],['finishes','05 / Finish','Review finishes and opening frames before furnishing.'],['proposed','06 / Handover','Walk or present the completed concept.']];
globalThis.GreenShiftDesign=Object.freeze({styles:Object.freeze(styles),stages:Object.freeze(stages)});
})();
