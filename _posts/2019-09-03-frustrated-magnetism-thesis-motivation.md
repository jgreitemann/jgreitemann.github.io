---
layout: post
title:  "Frustrated magnetism: Thesis motivation"
date:   2019-09-03 23:58:09+02:00
tags:
  - physics
  - thesis
  - machine-learning
math-enabled: true
excerpt: "Frustration is ubiquitous in nature. This post explores its effects on magnetic systems, giving rise to spin liquid behavior and hidden multipolar spin order. Recognizing these phenomena is nontrivial and motivated the inception of a machine-learning scheme to do so automatically."
disclaimer: "This post is adapted from the introduction of my PhD thesis. The full thesis will be made available in late October."
---

#### From water to spin ice

Frustration is ubiquitous in nature.
So much so that the properties of water, including its unusually high melting and boiling points, its large heat capacity, latent heat, and anomalous density curve---all crucial for the development of life as we know it---are all consequences of frustration.

{% include figure.html
   url="/assets/img/WaterIce5.png"
   width="50%"
   class=""
   caption="Figure 1: A configuration of five water molecules obeying the ice rules: each oxygen is covalently bound to two hydrogens and exactly one hydrogen sits between any two neighboring oxygens." %}

It is well known that the hydrogen atoms in $$\mathrm{H_2O}$$ span an angle of about $$104^\circ$$, slightly less than the $$109^\circ$$ corresponding to the unperturbed tetrahedral coordination of hybridized $$sp^3$$ orbitals of the central oxygen atom.
This leads to a nonvanishing dipolar moment due to the partial charges induced by the larger electronegativity of oxygen as compared to hydrogen.
In water ice (specifically the ice $$\mathrm{I}_h$$ phase formed under terrestrial conditions), the molecules are arranged in a lattice with close to tetrahedral bond angles as well.
Due to the partial charges, it is energetically favorable for exactly one hydrogen to sit between any neighboring oxygen atoms, being covalently bound to one of them and forming a weak "hydrogen" bond with the other.
The orientation of the water molecules in the lattice is then determined by the Bernal-Fowler "ice rules" \[[1][ref-1]\] which state that each molecule should be faced by the hydrogen atoms of two of its neighbors and the oxygen sides of the other two.
An example of a configuration respecting these ice rules is shown in Fig. 1.

The ice rules do not uniquely determine the ground-state configuration of water ice. Rather, the number of compatible configurations, _i.e._ the degeneracy of the ground state, grows exponentially with system size.
This then gives rise to an extensive contribution to the residual entropy which was famously estimated by Pauling as $$S_0/n = \ln(3/2) R\approx 3.4\,\mathrm{J}/(\mathrm{mol\,K})$$ \[[2][ref-2]\].
The extensive residual entropy consequently affects the thermodynamics of bulk properties and leads to the above anomalies associated with water.
An exponential ground-state degeneracy is one of the hallmarks of frustrated systems.
Somewhat sloppily, it is more commonly referred to as an extensive ground state degeneracy (exGSD) because it gives rise to an extensive residual entropy.

{% include figure.html
   url="/assets/img/SpinIce5.png"
   width="50%"
   class=""
   caption="Figure 2: The equivalent spin ice configuration on a pyrochlore lattice. For each tetrahedral cluster, two spins are pointing inwards and two are pointing outwards." %}

An analogous situation is realized in a class of magnetic systems which---for this reason---are known as spin ices.
Experimental realizations of spin ices have been discovered in the rare-earth oxide materials $$\mathrm{Ho_2Ti_2O_7}$$ \[[3][ref-3]\] and $$\mathrm{Dy_2Ti_2O_7}$$ \[[4][ref-4],[5][ref-5]\].
In these compounds, only the rare-earth ions ($$\mathrm{Ho}^{3+}$$ and $$\mathrm{Dy}^{3+}$$) are magnetic.
These form a pyrochlore lattice, a network of corner-sharing tetrahedra; its geometry is depicted in Fig. 2.
Due to a strong crystal-field anisotropy along the axis connecting the centers of tetrahedra, the magnetic moments behave as Ising spins.
The energy of such a configuration is then minimized if within each of the tedrahedra, two of the spins point inwards, while the other two point outwards.
This "two-in-two-out" rule is the spin-ice analogue of the ice rules in water.
Indeed, Fig. 2 depicts a configuration obeying the two-in-two-out rule which is equivalent to the water ice configuration in Fig. 1 by having the spins in the former point towards the location of each of the hydrogen atoms in the latter.
The residual entropy of $$\mathrm{Dy_2Ti_2O_7}$$ has been found from its heat capacity to be consistent with that of water ice $$\mathrm{I}_h$$ and Pauling's estimate \[[6][ref-6]\].

#### Gauge theoretical description and magnetic monopoles

The fluctuations permitted by the spin-ice rule may also be understood by analogy to magnetostatics.
By identifying the spins $$\mathbf S_i$$ at positions $$\mathbf r_i$$ in the lattice with the local strength of an artificial magnetic field $$\mathbf B(\mathbf r_i)=\mathbf S_i$$, the spin-ice rule can be summarized in a generalize Gauss' law, $$\mathbf\nabla\cdot\mathbf B=0$$ \[[7][ref-7]\]. Hence, two magnetic "field lines" enter into each lattice tetrahedron and likewise two also exit it.
After coarse graining, this immediately implies that the correlations between magnetic fields a distance $$\mathbf r$$ apart take on a dipolar form \[[8][ref-8],[9][ref-9],[10][ref-10]\],

$$\left\langle\mathbf B(\mathbf 0)\otimes \mathbf B(\mathbf r)\right\rangle\sim \frac{\mathbf{r}^{\otimes 2} - \|\mathbf r\|^2/3}{\|\mathbf r\|^5},$$

and thus decays as $$1/\|\mathbf r\|^3$$ at large distances.
Power-law correlations like this are unusual away from critical regimes. They manifest themselves as sharp features called "pinch points" in the spin structure factor and have been observed in neutron scattering experiments on $$\mathrm{Ho_2Ti_2O_7}$$ \[[11][ref-11]\].

Violations of the spin-ice rule lead to defects for which $$\mathbf\nabla\cdot\mathbf B$$ takes on a nonvanishing value which may be interpreted as a magnetic "charge" density. Excitations above the ground state manifold thus correspond to the creation of a pair of magnetic monopoles of opposite charge at which a magnetic field line---in this context referred to as a Dirac string---originates and terminates, respectively \[[7][ref-7],[12][ref-12],[13][ref-13]\].
Once created, the monopoles can move away from each other at no additional energy cost.
They thus constitute fractionalized excitations and the energy associated with each monopole is half that of a single spin flip \[[14][ref-14]\].
Since the spins carry a magnetic moment, these monopoles exert a magnetostatic Coulomb interaction onto each other.
This is weak compared to the electrostatic force but its signature was nonetheless first measured in diffuse neutron scattering experiments on $$\mathrm{Dy_2Ti_2O_7}$$ in 2009 \[[15][ref-15]\].
The ensuing onslaught of experiments has focussed primarily on the dynamics of monopoles both in classical \[[16][ref-16]\] and quantum \[[17][ref-17]\] spin ices.
Monopoles have also been observed in artificial spin ice realized in lithographically fabricated magnetic nanodevices \[[18][ref-18]\].

#### Classical and quantum spin liquids

Spin ices are the posterchild of a class of correlated spin states, nowadays collectively known as classical spin liquids (CSLs).
More traditionally, these have also been called correlated or cooperative paramagnets as they crucially do not exhibit long-range order, but rather strong algebraically decaying correlations.
As in the case of spin ice, these originate from fluctuations within an extensive ground-state manifold which is characterized by local constraints such as the spin-ice rule.
The constraints in turn signal the emergence of a gauge theoretical structure, complete with monopole-like fractionalized excitations.

At low enough temperatures, even fluctuations within the ground-state manifold eventually slow down and the CSL may freeze out of equilibrium.
For example, in spin ice, at the very least hexagonal rings of six spins can cooperatively flip at once while remaining in the ground state.
The ever-smaller tunneling probabilities for such _zero modes_ hence cause the spins to freeze into an amorphous glassy state; in $$\mathrm{Dy_2Ti_2O_7}$$ this reportedly happens below $$T_f=0.5\,\mathrm{K}$$ \[[19][ref-19]\].
Other types of CSLs may instead enter into an ordered phase below a transition temperature $$T_c$$ (see "Hidden order" below for a possible mechanism).
Either way, the relevant temperatures are expected to lie significantly below the scale set by the Curie-Weiss temperature $$|\Theta_\text{CW}|$$ which provides a rough estimate for the ordering temperature in unfrustrated systems.
$$\Theta_\text{CW}$$ can be determined from the asymptotic high-temperature behavior of the magnetic susceptibility, $$\chi^{-1}\sim (T - \Theta_\text{CW})$$.
The frustration-induced CSL behavior thus takes hold in the regime $$T_c$$&lt;$$T$$&lt;$$|\Theta_\text{CW}|$$ and its extent is commonly quantified by the frustration parameter $$f=|\Theta_\text{CW}|/T_c$$ (or $$f=|\Theta_\text{CW}|/T_f$$ in case of freezing).
While $$f\sim 5$$ may otherwise still occur, frustration can easily result in $$f\gg 100$$ \[[20][ref-20]\].

Materials with small atomic spins might, however, display an entirely different behavior at the lowest temperatures:
quantum fluctuations due to a nonvanishing zero-point energy may allow for the formation of a quantum spin liquid (QSL) which persists down to $$T=0$$, corresponding to $$f=\infty$$.

The energy between any two antiferromagnetically coupled spins is locally minimized by a singlet. One may naively assume that the ground state thus consists of a product of such valence bond singlets, periodically tiled over the bonds of the lattice.
Such a valence bond solid (VBS) has a vanishing total spin and is hence nonmagnetic, yet by choosing a specific dimer covering, it breaks lattice symmetries.
Anderson proposed that a system might rather form a superposition of all possible dimer coverings of spins into valence bonds on the lattice \[[21][ref-21]--[23][ref-23]\], thereby retaining the lattice symmetry.
In the language of quantum chemistry, such a state would exhibit valence bonds which constantly fluctuate amongst each other, but do so in a phase-coherent (highly entangled) way, thus coining the name resonating valence bond (RVB) state.

The RVB state is the archetype of QSLs, but a superposition of dimer coverings is not the only possible microscopic realization of a QSL state and a consensus on the defining characteristics of a QSL was not reached until recently (and even that is debateable).
Quite generally, however, a "true" QSL would be expected to host fractionalized excitations \[[20][ref-20],[24][ref-24]\].
This makes them attractive for quantum computation as it allows for the development of topological error correction codes, as exemplified by Kitaev's toric code \[[25][ref-25],[26][ref-26]\].
Unfortunately, as of yet, not a single QSL has been experimentally identified in an unambiguous way, despite tremendous effort over the past decade.
Extensive reviews of the state of the art of experiments into both CSLs and QSL candidates are provided in Refs. [24][ref-24] and [27][ref-27].


#### Hidden order

The experimental identification of spin liquids, both classical and quantum, typically has to resort to a negative definition, _i.e._ ruling out the presence of any symmetry-breaking order, in lieu of experimentally accessible genuine spin-liquid characteristics.
This is further complicated by the fact that such orders in frustrated lattice geometries may too elude common experimental probes as they do not give rise to a macroscopically observable magnetization.
For this reason, they are referred to as "hidden" orders \[[28][ref-28]--[33][ref-33]\].

Indeed, even in Monte Carlo simulations of classical spin models where one has access to the full microscopic spin configuration, identifying the presence of hidden orders remains a highly nontrivial task.
This is due to their multipolar nature: in contrast to dipolar orders whose symmetry-breaking is characterized by a nonvanishing vector-like (rank-1) order parameter such as the (staggered) magnetization in the case of (anti)ferromagnetism, frustrated lattice geometries may favor orders which only break part of the full spin-rotational symmetry while staying disordered with respect to the remaining symmetry, giving rise to order parameter tensors of higher rank such as matrices (quadrupolar order) or third-rank tensors (octupolar order).
Examples can be found in spin nematic orders \[[34][ref-34]--[45][ref-45]\].
Conventional numeric probes then often suffer the same fate as their experimental counterparts and one has to resort to (weak) signatures in thermodynamic properties such as the heat capacity to pin down the presence of a phase transition.
Even then, this does not yield any insight into the nature of the tentative phase.

It may seem paradoxical at first that a spin system whose ground state manifold is defined by constraints, which in and of themselves do not break any symmetries, would develop an ordered phase at low temperatures.
One mechanism to facilitate symmetry-breaking in classical systems was first described by Villain _et al._ \[[46][ref-46]\].
While by definition all ground states have the same energy, some of them may be entropically selected for their lower free energy.
This is the case when a certain subset of ground state configurations admits thermal fluctuations into a vast region of phase space surrounding these ground states at small energy expenditure by means of soft modes[^1].
The phenomenon was coined _order-by-disorder_ \[[8][ref-8]\] and famously accounts--among other cases \[[47][ref-47]\]---for the selection of coplanar spin order in the Heisenberg antiferromagnet on the kagome lattice which was postulated by Chalker _et al._ in 1992 \[[48][ref-48]\].
However, his initial description in terms of a quadrupolar order parameter was later recognized as incomplete and rather called for an additional octupolar order parameter \[[49][ref-49]--[51][ref-51]\].

#### Premise of my PhD thesis

The study of frustrated magnets, particularly the quest for spin liquids---both classical and quantum---remains an active field of research in both theory and experiment.
While QSLs have proved more elusive, the occurrence and stability of CSLs, especially as compared to spin nematic phases, is far from understood.
Advances in experimental techniques over the past decade have accelerated the pace of the synthesis and charaterization of new materials to the point where it has become a matter of months, not years.
Meanwhile the process of piecing together the phase diagram of each new model remains a laborious and manual process which heavily depends on the ingenuity and intuition of individual researchers, rendering it a serious bottleneck.

Devising a machine learning scheme to aid this process, inspired by the recent sprawl of activity, thus seemed like a worthwhile endeavor.
However, merely recognizing different phases in frustrated models---while useful---would not have sufficed; rather, a highly interpretable machine is in demand which allows for the reconstruction of the physical order parameter.
For this reason, we turned to kernel methods and proposed a _tensorial kernel_ (TK) function.
As the name suggests, its functional form was chosen to be capable of expressing tensorial order parameters like those characteristic of multipolar order, while not imposing any further restrictions other than locality.
Its design thus does not require the problem to be already "solved", but covers the realm of multipolar tensor order parameters exhaustively.
When combined with a support vector machine, it is jointly referred to as TK-SVM, but the use in conjunction with kernel principal component analysis (kPCA) has also been demonstrated.

In my thesis, the TK is applied to the infamous case of the aforementioned Heisenberg model on the kagome lattice as well as the XXZ model on the pyrochlore lattice which features a diverse phase diagram, including a spin nematic phase and three types of CSLs \[[52][ref-52],[53][ref-53]\].
Indeed, the order parameter tensors of both the spin nematic phase in the case of the XXZ pyrochlore model and the _complete_ characterization of the hidden order in the kagome model have been identified by TK-SVM.

Serendipitously, while the original design of the TK was aimed at expressing multipolar order, it turned out to be also capable of expressing the emergent constraints which characterize the ground-state manifold of CSLs and underpin their gauge-theoretical description.
In that regard, the method went above and beyond expectations and reconstructed the phase diagram of the XXZ pyrochlore model, including the location of the crossover regimes between different types of CSLs, with little human guidance.

[^1]: The term "soft mode" usually refers to any kind of gapless mode, including those with linearly vanishing dispersions; here, modes need to be even "softer", with at-most quadratic dispersion, to fluctuate appreciably down to the low temperatures required for order to emerge.

#### References

<ul id="references">
	<li class="unlinked">
		<a name="ref-1"></a>
		<span class="pub-index">[1]</span>
		<span markdown="1">
J. D. Bernal and R. H. Fowler. _A Theory of Water and Ionic Solution, with Particular Reference to Hydrogen and Hydroxyl Ions._ [J. Chem. Phys. **1**, 515–548][doi-1] (1933).
		</span>
	</li>
	<li class="unlinked">
		<a name="ref-2"></a>
		<span class="pub-index">[2]</span>
		<span markdown="1">
Linus Pauling. _The Structure and Entropy of Ice and of Other Crystals with Some Randomness of Atomic Arrangement._ [J. Am. Chem. Soc. **57**, 2680–2684][doi-2] (1935).
        </span>
	</li>
	<li class="unlinked">
		<a name="ref-3"></a>
		<span class="pub-index">[3]</span>
		<span markdown="1">
M. J. Harris, S. T. Bramwell, D. F. McMorrow, T. Zeiske, and K. W. Godfrey. _Geometrical Frustration in the Ferromagnetic Pyrochlore_ Ho₂Ti₂O₇. [Phys. Rev. Lett. **79**, 2554–2557][doi-2] (1997).
        </span>
	</li>
    <li class="unlinked">
        <a name="ref-4"></a>
        <span class="pub-index">[4]</span>
        <span markdown="1">
Steven T. Bramwell and Michel J. P. Gingras. _Spin Ice State in Frustrated Magnetic Pyrochlore Materials._ [Science **294**, 1495–1501][doi-4] (2001).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-5"></a>
        <span class="pub-index">[5]</span>
        <span markdown="1">
Jason S. Gardner, Michel J. P. Gingras, and John E. Greedan. _Magnetic pyrochlore oxides._ [Rev. Mod. Phys. **82**, 53–107][doi-5] (2010).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-6"></a>
        <span class="pub-index">[6]</span>
        <span markdown="1">
A. P. Ramirez, A. Hayashi, R. J. Cava, R. Siddharthan, and B. S. Shastry. _Zero-point entropy in 'spin ice'._ [Nature **399**, 333–335][doi-6] ((1999).).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-7"></a>
        <span class="pub-index">[7]</span>
        <span markdown="1">
Claudio Castelnovo, Roderich Moessner, and Shivaji L. Sondhi. _Magnetic monopoles in spin ice._ [Nature **451**, 42–45][doi-7] (2008).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-8"></a>
        <span class="pub-index">[8]</span>
        <span markdown="1">
John T. Chalker. _Geometrically Frustrated Antiferromagnets: Statistical Mechanics and Dynamics._ In Claudine Lacroix, Philippe Mendels, and Frédéric Mila, editors, _Introduction to Frustrated Magnetism_, chapter 1. Springer Berlin Heidelberg (2011). ISBN 978-3-642-10588-3.
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-9"></a>
        <span class="pub-index">[9]</span>
        <span markdown="1">
Christopher L. Henley. _Power-law spin correlations in pyrochlore antiferromagnets._ [Phys. Rev. B **71**, 014424][doi-9] (2005).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-10"></a>
        <span class="pub-index">[10]</span>
        <span markdown="1">
Christopher L. Henley. _The "Coulomb Phase" in Frustrated Systems._ [Annu. Rev. Condens. Matter Phys. **1**, 179–210][doi-10] (2010).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-11"></a>
        <span class="pub-index">[11]</span>
        <span markdown="1">
T. Fennell, P. P. Deen, A. R. Wildes, K. Schmalzl, D. Prabhakaran, A. T. Boothroyd, R. J. Aldus, D. F. McMorrow, and S. T. Bramwell. _Magnetic Coulomb Phase in the Spin Ice_ Ho₂Ti₂O₇. [Science **326**, 415–417][doi-11] (2009).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-12"></a>
        <span class="pub-index">[12]</span>
        <span markdown="1">
Ivan A. Ryzhkin. _Magnetic relaxation in rare-earth oxide pyrochlores._ [J. Exp. Theor. Phys. **101**, 481–486][doi-12] (2005).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-13"></a>
        <span class="pub-index">[13]</span>
        <span markdown="1">
Claudio Castelnovo, Roderich Moessner, and Shivaji L. Sondhi. _Spin Ice, Fractionalization, and Topological Order._ [Annu. Rev. Condens. Matter Phys. **3**, 35–55][doi-13] (2012).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-14"></a>
        <span class="pub-index">[14]</span>
        <span markdown="1">
Ludovic D. C. Jaubert and Peter C. W. Holdsworth. _Signature of magnetic monopole and Dirac string dynamics in spin ice._ [Nat. Phys. **5**, 258–261][doi-14] (2009).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-15"></a>
        <span class="pub-index">[15]</span>
        <span markdown="1">
D. J. P. Morris, D. A. Tennant, S. A. Grigera, B. Klemke, C. Castelnovo, R. Moessner, C. Czternasty, M. Meissner, K. C. Rule, J.-U. Hoffmann, K. Kiefer, S. Gerischer, D. Slobinsky, and R. S. Perry. _Dirac Strings and Magnetic Monopoles in the Spin Ice_ Dy₂Ti₂O₇. [Science **326**, 411–414][doi-15] (2009).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-16"></a>
        <span class="pub-index">[16]</span>
        <span markdown="1">
Sean R. Giblin, Steven T. Bramwell, Peter C. W. Holdsworth, Dharmalingam Prabhakaran, and Ian Terry. _Creation and measurement of long-lived magnetic monopole currents in spin ice._ [Nat. Phys. **7**, 252–258][doi-16] (2011).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-17"></a>
        <span class="pub-index">[17]</span>
        <span markdown="1">
Bruno Tomasello, Claudio Castelnovo, Roderich Moessner, and Jorge Quintanilla. _Correlated Quantum Tunneling of Monopoles in Spin Ice._ [Phys. Rev. Lett. **123**, 067204][doi-17] (2019).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-18"></a>
        <span class="pub-index">[18]</span>
        <span markdown="1">
Yann Perrin, Benjamin Canals, and Nicolas Rougemaille. _Extensive degeneracy, Coulomb phase and magnetic monopoles in artificial square ice._ [Nature **540**, 410–413][doi-18] (2016).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-19"></a>
        <span class="pub-index">[19]</span>
        <span markdown="1">
H. Fukazawa, R. G. Melko, R. Higashinaka, Y. Maeno, and M. J. P. Gingras. _Magnetic anisotropy of the spin-ice compound_ Dy₂Ti₂O₇. [Phys. Rev. B **65**, 054410][doi-19] (2002).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-20"></a>
        <span class="pub-index">[20]</span>
        <span markdown="1">
Leon Balents. _Spin liquids in frustrated magnets._ [Nature **464**, 199–208][doi-20] (2010).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-21"></a>
        <span class="pub-index">[21]</span>
        <span markdown="1">
G. Baskaran, Z. Zou, and P. W. Anderson. _The resonating valence bond state and high-T<sub>c</sub> superconductivity — A mean field theory._ [Solid State Commun. **63**, 973–976][doi-21] (1987).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-22"></a>
        <span class="pub-index">[22]</span>
        <span markdown="1">
P. W. Anderson, G. Baskaran, Z. Zou, and T. Hsu. _Resonating-valence-bond theory of phase transitions and superconductivity in_ La₂CuO₄_-based compounds._ [Phys. Rev. Lett. **58**, 2790–2793][doi-22] (1987).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-23"></a>
        <span class="pub-index">[23]</span>
        <span markdown="1">
G. Baskaran and P. W. Anderson. _Gauge theory of high-temperature superconductors and strongly correlated Fermi systems._ [Phys. Rev. B **37**, 580–583][doi-23] (1988).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-24"></a>
        <span class="pub-index">[24]</span>
        <span markdown="1">
Lucile Savary and Leon Balents. _Quantum spin liquids: a review._ [Rep. Prog. Phys. **80**, 016502][doi-24] (2017).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-25"></a>
        <span class="pub-index">[25]</span>
        <span markdown="1">
Alexei Yu. Kitaev. _Fault-tolerant quantum computation by anyons._ [Ann. Phys. (N. Y.) **303**, 2–30][doi-25] (2003).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-26"></a>
        <span class="pub-index">[26]</span>
        <span markdown="1">
Alexei Kitaev and Chris Laumann. _Topological quantum phases and quantum computation._ In Jesper Jacobsen, Stephane Ouvry, Vincent Pasquier, Didina Serban, and Leticia Cugliandolo, editors, _Exact Methods in Low-dimensional Statistical Physics and Quantum Computing_, volume 89 of _Lecture Notes of the Les Houches Summer School_, chapter 4. Oxford University Press, Oxford, U.K. (2008), [arXiv:0904.2771][doi-26].
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-27"></a>
        <span class="pub-index">[27]</span>
        <span markdown="1">
Yi Zhou, Kazushi Kanoda, and Tai-Kai Ng. _Quantum spin liquid states._ [Rev. Mod. Phys. **89**, 025003][doi-27] (2017).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-28"></a>
        <span class="pub-index">[28]</span>
        <span markdown="1">
Nic Shannon, Tsutomu Momoi, and Philippe Sindzingre. _Nematic Order in Square Lattice Frustrated Ferromagnets._ [Phys. Rev. Lett. **96**, 027213][doi-28] (2006).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-29"></a>
        <span class="pub-index">[29]</span>
        <span markdown="1">
John A. Mydosh and Peter M. Oppeneer. Colloquium: _Hidden order, superconductivity, and magnetism: The unsolved case of_ URu₂Si₂. [Rev. Mod. Phys. **83**, 1301–1322][doi-29] (2011).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-30"></a>
        <span class="pub-index">[30]</span>
        <span markdown="1">
Joseph A. M. Paddison, Henrik Jacobsen, Oleg A. Petrenko, Maria Teresa Fernández-Díaz, Pascale P. Deen, and Andrew L. Goodwin. _Hidden order in spin-liquid_ Gd₃Ga₅O₁₂. [Science **350**, 179–181][doi-30] (2015).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-31"></a>
        <span class="pub-index">[31]</span>
        <span markdown="1">
Yao-Dong Li, Xiaoqun Wang, and Gang Chen. _Hidden multipolar orders of dipole-octupole doublets on a triangular lattice._ [Phys. Rev. B **94**, 201114][doi-31] (2016).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-32"></a>
        <span class="pub-index">[32]</span>
        <span markdown="1">
H. Takatsu, S. Onoda, S. Kittaka, A. Kasahara, Y. Kono, T. Sakakibara, Y. Kato, B. Fåk, J. Ollivier, J. W. Lynn, T. Taniguchi, M. Wakita, and H. Kadowaki. _Quadrupole Order in the Frustrated Pyrochlore_ Tb<sub>2+x</sub>Ti<sub>2-x</sub>O<sub>7+y</sub>. [Phys. Rev. Lett. **116**, 217201][doi-32] (2016).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-33"></a>
        <span class="pub-index">[33]</span>
        <span markdown="1">
Qiang Luo, Shijie Hu, Bin Xi, Jize Zhao, and Xiaoqun Wang. _Ground-state phase diagram
of an anisotropic spin-½ model on the triangular lattice._ [Phys. Rev. B **95**, 165110][doi-33] (2017).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-34"></a>
        <span class="pub-index">[34]</span>
        <span markdown="1">
A. F. Andreev and I. A. Grishchuk. _Spin Nematics._ J. Exp. Theor. Phys. 87, 467–475 (1984).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-35"></a>
        <span class="pub-index">[35]</span>
        <span markdown="1">
Andrey V. Chubukov. _Fluctuations in spin nematics._ J. Phys.: Condens. Matter 2, 1593 (1990).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-36"></a>
        <span class="pub-index">[36]</span>
        <span markdown="1">
Tsutomu Momoi, Philippe Sindzingre, and Nic Shannon. _Octupolar Order in the Multiple Spin Exchange Model on a Triangular Lattice._ [Phys. Rev. Lett. **97**, 257204][doi-36] (2006).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-37"></a>
        <span class="pub-index">[37]</span>
        <span markdown="1">
Tsutomu Momoi, Philippe Sindzingre, and Kenn Kubo. _Spin Nematic Order in Multiple-Spin Exchange Models on the Triangular Lattice._ [Phys. Rev. Lett. **108**, 057206][doi-37] (2012).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-38"></a>
        <span class="pub-index">[38]</span>
        <span markdown="1">
Roderich Moessner and John T. Chalker. _Low-temperature properties of classical geometrically frustrated antiferromagnets._ [Phys. Rev. B **58**, 12049–12062][doi-38] (1998).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-39"></a>
        <span class="pub-index">[39]</span>
        <span markdown="1">
Andreas Läuchli, Frédéric Mila, and Karlo Penc. _Quadrupolar Phases of the S=1 Bilinear-Biquadratic Heisenberg Model on the Triangular Lattice._ [Phys. Rev. Lett. **97**, 087205][doi-39] (2006).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-40"></a>
        <span class="pub-index">[40]</span>
        <span markdown="1">
Congjun Wu. _Orbital Ordering and Frustration of p-Band Mott Insulators._ [Phys. Rev. Lett. **100**, 200406][doi-40] (2008).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-41"></a>
        <span class="pub-index">[41]</span>
        <span markdown="1">
J. Yamaura, K. Ohgushi, H. Ohsumi, T. Hasegawa, I. Yamauchi, K. Sugimoto, S. Takeshita, A. Tokuda, M. Takata, M. Udagawa, M. Takigawa, H. Harima, T. Arima, and Z. Hiroi. _Tetrahedral Magnetic Order and the Metal-Insulator Transition in the Pyrochlore Lattice of_ Cd₂Os₂O₇. [Phys. Rev. Lett. **108**, 247205][doi-41] (2012).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-42"></a>
        <span class="pub-index">[42]</span>
        <span markdown="1">
M. Mourigal, M. Enderle, B. Fåk, R. K. Kremer, J. M. Law, A. Schneidewind, A. Hiess, and A. Prokofiev. _Evidence of a Bond-Nematic Phase in_ LiCuVO₄. [Phys. Rev. Lett. **109**, 027203][doi-42] (2012).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-43"></a>
        <span class="pub-index">[43]</span>
        <span markdown="1">
O. Janson, J. Richter, P. Sindzingre, and H. Rosner. _Coupled frustrated quantum spin-½ chains with orbital order in volborthite_ Cu₃V₂O₇(OH)₂ · 2H₂O. [Phys. Rev. B **82**, 104434][doi-43] (2010).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-44"></a>
        <span class="pub-index">[44]</span>
        <span markdown="1">
R. Wawrzyńczak, Y. Tanaka, M. Yoshida, Y. Okamoto, P. Manuel, N. Casati, Z. Hiroi, M. Takigawa, and G. J. Nilsen. _Classical Spin Nematic Transition in_ LiGa<sub>0.95</sub>In<sub>0.05</sub>Cr<sub>4</sub>O<sub>8</sub>. [Phys. Rev. Lett. **119**, 087201][doi-44] (2017).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-45"></a>
        <span class="pub-index">[45]</span>
        <span markdown="1">
A. Orlova, E. L. Green, J. M. Law, D. I. Gorbunov, G. Chanda, S. Krämer, M. Horvatić, R. K. Kremer, J. Wosnitza, and G. L. J. A. Rikken. _Nuclear Magnetic Resonance Signature of the Spin-Nematic Phase in_ LiCuVO₄ _at High Magnetic Fields._ [Phys. Rev. Lett. **118**, 247201][doi-45] (2017).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-46"></a>
        <span class="pub-index">[46]</span>
        <span markdown="1">
Jacques Villain, R. Bidaux, J.-P. Carton, and R. Conte. _Order as an effect of disorder._ [J. Phys. France **41**, 1263–1272][doi-46] (1980).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-47"></a>
        <span class="pub-index">[47]</span>
        <span markdown="1">
Doron Bergman, Jason Alicea, Emanuel Gull, Simon Trebst, and Leon Balents. _Order-by-disorder and spiral spin-liquid in frustrated diamond-lattice antiferromagnets._ [Nat. Phys.
**3**, 487–491][doi-47] (2007).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-48"></a>
        <span class="pub-index">[48]</span>
        <span markdown="1">
John T. Chalker, Peter C. W. Holdsworth, and E. F. Shender. _Hidden order in a frustrated system: Properties of the Heisenberg Kagomé antiferromagnet._ [Phys. Rev. Lett. **68**, 855–858][doi-48] (1992).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-49"></a>
        <span class="pub-index">[49]</span>
        <span markdown="1">
I. Ritchey, P. Chandra, and P. Coleman. _Spin folding in the two-dimensional Heisenberg kagomé antiferromagnet._ [Phys. Rev. B **47**, 15342–15345][doi-49] (1993).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-50"></a>
        <span class="pub-index">[50]</span>
        <span markdown="1">
Michael E. Zhitomirsky. _Field-Induced Transitions in a Kagomé Antiferromagnet._ [Phys. Rev. Lett. **88**, 057204][doi-50] (2002).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-51"></a>
        <span class="pub-index">[51]</span>
        <span markdown="1">
Michael E. Zhitomirsky. _Octupolar ordering of classical kagome antiferromagnets in two and three dimensions._ [Phys. Rev. B **78**, 094423][doi-51] (2008).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-52"></a>
        <span class="pub-index">[52]</span>
        <span markdown="1">
Mathieu Taillefumier, Owen Benton, Han Yan, L. D. C. Jaubert, and Nic Shannon. _Competing Spin Liquids and Hidden Spin-Nematic Order in Spin Ice with Frustrated Transverse Exchange._ [Phys. Rev. X **7**, 041057][doi-52] (2017).
        </span>
    </li>
    <li class="unlinked">
        <a name="ref-53"></a>
        <span class="pub-index">[53]</span>
        <span markdown="1">
Owen Benton, Ludovic D. C. Jaubert, Rajiv R. P. Singh, Jaan Oitmaa, and Nic Shannon. _Quantum Spin Ice with Frustrated Transverse Exchange: From a π-Flux Phase to a Nematic
Quantum Spin Liquid._ [Phys. Rev. Lett. **121**, 067201][doi-53] (2018).
        </span>
    </li>
</ul>

[ref-1]: #ref-1
[ref-2]: #ref-2
[ref-3]: #ref-3
[ref-4]: #ref-4
[ref-5]: #ref-5
[ref-6]: #ref-6
[ref-7]: #ref-7
[ref-8]: #ref-8
[ref-9]: #ref-9
[ref-10]: #ref-10
[ref-11]: #ref-11
[ref-12]: #ref-12
[ref-13]: #ref-13
[ref-14]: #ref-14
[ref-15]: #ref-15
[ref-16]: #ref-16
[ref-17]: #ref-17
[ref-18]: #ref-18
[ref-19]: #ref-19
[ref-20]: #ref-20
[ref-21]: #ref-21
[ref-22]: #ref-22
[ref-23]: #ref-23
[ref-24]: #ref-24
[ref-25]: #ref-25
[ref-26]: #ref-26
[ref-27]: #ref-27
[ref-28]: #ref-28
[ref-29]: #ref-29
[ref-30]: #ref-30
[ref-31]: #ref-31
[ref-32]: #ref-32
[ref-33]: #ref-33
[ref-34]: #ref-34
[ref-35]: #ref-35
[ref-36]: #ref-36
[ref-37]: #ref-37
[ref-38]: #ref-38
[ref-39]: #ref-39
[ref-40]: #ref-40
[ref-41]: #ref-41
[ref-42]: #ref-42
[ref-43]: #ref-43
[ref-44]: #ref-44
[ref-45]: #ref-45
[ref-46]: #ref-46
[ref-47]: #ref-47
[ref-48]: #ref-48
[ref-49]: #ref-49
[ref-50]: #ref-50
[ref-51]: #ref-51
[ref-52]: #ref-52
[ref-53]: #ref-53
[doi-1]: https://doi.org/10.1063/1.1749327
[doi-2]: https://doi.org/10.1021/ja01315a102
[doi-3]: https://doi.org/10.1103/PhysRevLett.79.2554
[doi-4]: https://doi.org/10.1126/science.1064761
[doi-5]: https://doi.org/10.1103/RevModPhys.82.53
[doi-6]: https://doi.org/10.1038/20619
[doi-7]: https://doi.org/10.1038/nature06433
[doi-9]: https://doi.org/10.1103/PhysRevB.71.014424
[doi-10]: https://doi.org/10.1146/annurev-conmatphys-070909-104138
[doi-11]: https://doi.org/10.1126/science.1177582
[doi-12]: https://doi.org/10.1134/1.2103216
[doi-13]: https://doi.org/10.1146/annurev-conmatphys-020911-125058
[doi-14]: https://doi.org/10.1038/nphys1227
[doi-15]: https://doi.org/10.1126/science.1178868
[doi-16]: https://doi.org/10.1038/nphys1896
[doi-17]: https://doi.org/10.1103/PhysRevLett.123.067204
[doi-18]: https://doi.org/10.1038/nature20155
[doi-19]: https://doi.org/10.1103/PhysRevB.65.054410
[doi-20]: https://doi.org/10.1038/nature08917
[doi-21]: https://doi.org/10.1016/0038-1098(87)90642-9
[doi-22]: https://doi.org/10.1103/PhysRevLett.58.2790
[doi-23]: https://doi.org/10.1103/PhysRevB.37.580
[doi-24]: https://doi.org/10.1088/0034-4885/80/1/016502
[doi-25]: https://doi.org/10.1016/S0003-4916(02)00018-0
[doi-26]: https://arXiv.org/abs/0904.2771
[doi-27]: https://doi.org/10.1103/RevModPhys.89.025003
[doi-28]: https://doi.org/10.1103/PhysRevLett.96.027213
[doi-29]: https://doi.org/10.1103/RevModPhys.83.1301
[doi-30]: https://doi.org/10.1126/science.aaa5326
[doi-31]: https://doi.org/10.1103/PhysRevB.94.201114
[doi-32]: https://doi.org/10.1103/PhysRevLett.116.217201
[doi-33]: https://doi.org/10.1103/PhysRevB.95.165110
[doi-36]: https://doi.org/10.1103/PhysRevLett.97.257204
[doi-37]: https://doi.org/10.1103/PhysRevLett.108.057206
[doi-38]: https://doi.org/10.1103/PhysRevB.58.12049
[doi-39]: https://doi.org/10.1103/PhysRevLett.97.087205
[doi-40]: https://doi.org/10.1103/PhysRevLett.100.200406
[doi-41]: https://doi.org/10.1103/PhysRevLett.108.247205
[doi-42]: https://doi.org/10.1103/PhysRevLett.109.027203
[doi-43]: https://doi.org/10.1103/PhysRevB.82.104434
[doi-44]: https://doi.org/10.1103/PhysRevLett.119.087201
[doi-45]: https://doi.org/10.1103/PhysRevLett.118.247201
[doi-46]: https://doi.org/10.1051/jphys:0198000410110126300
[doi-47]: https://doi.org/10.1038/nphys622
[doi-48]: https://doi.org/10.1103/PhysRevLett.68.855
[doi-49]: https://doi.org/10.1103/PhysRevB.47.15342
[doi-50]: https://doi.org/10.1103/PhysRevLett.88.057204
[doi-51]: https://doi.org/10.1103/PhysRevB.78.094423
[doi-52]: https://doi.org/10.1103/PhysRevX.7.041057
[doi-53]: https://doi.org/10.1103/PhysRevLett.121.067201
