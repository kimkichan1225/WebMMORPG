import { usePlayerStore } from '../../stores/playerStore';
import { useSkillStore, Skill } from '../../stores/skillStore';
import { useEquipmentStore } from '../../stores/equipmentStore';
import type { Monster } from '../entities/Monster';

export interface DamageResult {
  damage: number;
  isCritical: boolean;
  type: 'physical' | 'magical';
  element?: string;
}

export interface SkillEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'teleport';
  value: number;
  duration?: number;
  aoe?: boolean;
  aoeRadius?: number;
  projectile?: boolean;
}

export class CombatSystem {
  private static instance: CombatSystem;

  static getInstance(): CombatSystem {
    if (!CombatSystem.instance) {
      CombatSystem.instance = new CombatSystem();
    }
    return CombatSystem.instance;
  }

  // Calculate total attack power including equipment and buffs
  calculateAttackPower(): number {
    const playerStore = usePlayerStore.getState();
    const equipmentStore = useEquipmentStore.getState();
    const skillStore = useSkillStore.getState();

    // Base attack from stats
    let attack = playerStore.attack;

    // Add equipment attack
    const equipStats = equipmentStore.getEquippedStats();
    attack += equipStats.attack || 0;

    // Add stat bonuses
    attack += (equipStats.str || 0) * 2; // STR adds 2 attack

    // Apply buff multipliers
    const buffEffects = skillStore.getActiveBuffEffects();
    attack *= (1 + buffEffects.attackBonus);

    return Math.floor(attack);
  }

  // Calculate total defense including equipment
  calculateDefense(): number {
    const playerStore = usePlayerStore.getState();
    const equipmentStore = useEquipmentStore.getState();

    let defense = playerStore.defense;

    const equipStats = equipmentStore.getEquippedStats();
    defense += equipStats.defense || 0;
    defense += (equipStats.vit || 0) * 1.5; // VIT adds 1.5 defense

    return Math.floor(defense);
  }

  // Calculate max HP including equipment bonuses
  calculateMaxHp(): number {
    const playerStore = usePlayerStore.getState();
    const equipmentStore = useEquipmentStore.getState();

    let maxHp = playerStore.maxHp;

    const equipStats = equipmentStore.getEquippedStats();
    maxHp += equipStats.hp || 0;
    maxHp += (equipStats.vit || 0) * 10; // VIT adds 10 HP

    return maxHp;
  }

  // Calculate max MP including equipment bonuses
  calculateMaxMp(): number {
    const playerStore = usePlayerStore.getState();
    const equipmentStore = useEquipmentStore.getState();

    let maxMp = playerStore.maxMp;

    const equipStats = equipmentStore.getEquippedStats();
    maxMp += equipStats.mp || 0;
    maxMp += (equipStats.int || 0) * 5; // INT adds 5 MP

    return maxMp;
  }

  // Calculate critical chance
  calculateCritChance(): number {
    const equipmentStore = useEquipmentStore.getState();
    const equipStats = equipmentStore.getEquippedStats();

    // Base 5% crit chance
    let critChance = 0.05;

    // LUK adds crit chance
    critChance += (equipStats.luk || 0) * 0.01;

    // DEX adds slight crit chance
    critChance += (equipStats.dex || 0) * 0.005;

    return Math.min(critChance, 0.5); // Cap at 50%
  }

  // Calculate evasion chance
  calculateEvasionChance(): number {
    const skillStore = useSkillStore.getState();
    const equipmentStore = useEquipmentStore.getState();
    const equipStats = equipmentStore.getEquippedStats();

    // Base 5% evasion
    let evasion = 0.05;

    // DEX adds evasion
    evasion += (equipStats.dex || 0) * 0.01;

    // Buff bonus
    const buffEffects = skillStore.getActiveBuffEffects();
    evasion += buffEffects.evasionBonus;

    return Math.min(evasion, 0.7); // Cap at 70%
  }

  // Calculate damage for a basic attack
  calculateBasicAttackDamage(targetDefense: number): DamageResult {
    const attack = this.calculateAttackPower();
    const critChance = this.calculateCritChance();

    // Check critical
    const isCritical = Math.random() < critChance;
    const critMultiplier = isCritical ? 1.5 : 1;

    // Damage formula: Attack - Defense * 0.5, minimum 1
    let damage = Math.max(1, attack - targetDefense * 0.5);
    damage *= critMultiplier;

    // Add some variance (±10%)
    damage *= 0.9 + Math.random() * 0.2;

    return {
      damage: Math.floor(damage),
      isCritical,
      type: 'physical'
    };
  }

  // Calculate damage for a skill attack
  calculateSkillDamage(skill: Skill, targetDefense: number): DamageResult {
    const playerStore = usePlayerStore.getState();
    const attack = this.calculateAttackPower();
    const critChance = this.calculateCritChance() + (skill.critBonus || 0);

    // Check critical
    const isCritical = Math.random() < critChance;
    const critMultiplier = isCritical ? 1.5 : 1;

    // Determine damage type based on job/skill
    const magicJobs = ['Mage'];
    const isMagical = magicJobs.includes(playerStore.job) || skill.element;

    let baseDamage: number;
    if (isMagical) {
      // Magical damage scales with INT
      const equipStats = useEquipmentStore.getState().getEquippedStats();
      const intBonus = (equipStats.int || 0) * 3;
      baseDamage = (attack + intBonus) * (skill.damage || 1);
      // Magic ignores some defense
      baseDamage -= targetDefense * 0.3;
    } else {
      // Physical damage
      baseDamage = attack * (skill.damage || 1);
      baseDamage -= targetDefense * 0.5;
    }

    baseDamage = Math.max(1, baseDamage);
    baseDamage *= critMultiplier;

    // Variance
    baseDamage *= 0.9 + Math.random() * 0.2;

    return {
      damage: Math.floor(baseDamage),
      isCritical,
      type: isMagical ? 'magical' : 'physical',
      element: skill.element
    };
  }

  // Execute skill and return effects
  executeSkill(skill: Skill): SkillEffect | null {
    const skillStore = useSkillStore.getState();

    // Try to use the skill (checks cooldown, MP)
    const result = skillStore.useSkill(skill.id);
    if (!result.success) {
      console.log(`Skill failed: ${result.error}`);
      return null;
    }

    // Determine effect based on skill
    if (skill.healAmount !== undefined) {
      // Healing skill
      const healValue = skill.healAmount + (skill.healScale || 0) * this.calculateAttackPower();
      return {
        type: 'heal',
        value: Math.floor(healValue)
      };
    }

    if (skill.teleportRange !== undefined) {
      // Teleport skill
      return {
        type: 'teleport',
        value: skill.teleportRange
      };
    }

    if (skill.type === 'buff') {
      // Buff skill
      return {
        type: 'buff',
        value: skill.attackBonus || skill.evasionBonus || 0,
        duration: skill.duration
      };
    }

    // Damage skill
    return {
      type: 'damage',
      value: skill.damage || 1,
      aoe: skill.aoe,
      aoeRadius: skill.aoeRadius,
      projectile: skill.projectile
    };
  }

  // Apply damage to monster (directly modifies hp)
  applyDamageToMonster(monster: Monster, damageResult: DamageResult): boolean {
    const actualDamage = Math.max(1, damageResult.damage - monster.defense);
    monster.hp -= actualDamage;

    if (monster.hp <= 0) {
      monster.isAlive = false;
      return true; // Monster killed
    }
    return false;
  }

  // Apply damage to player
  applyDamageToPlayer(damage: number): boolean {
    // Check evasion
    const evasion = this.calculateEvasionChance();
    if (Math.random() < evasion) {
      console.log('Player evaded!');
      return false;
    }

    // Apply defense reduction
    const defense = this.calculateDefense();
    const actualDamage = Math.max(1, damage - defense * 0.5);

    usePlayerStore.getState().takeDamage(Math.floor(actualDamage));
    return true;
  }

  // Get all monsters in range for AoE
  getMonstersInRange(
    monsters: Monster[],
    centerX: number,
    centerY: number,
    radius: number
  ): Monster[] {
    return monsters.filter(monster => {
      if (!monster.isAlive) return false;
      const dx = monster.x - centerX;
      const dy = monster.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= radius;
    });
  }

  // Check if target is in skill range
  isInRange(
    playerX: number,
    playerY: number,
    targetX: number,
    targetY: number,
    range: number
  ): boolean {
    const dx = targetX - playerX;
    const dy = targetY - playerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= range;
  }
}

export const combatSystem = CombatSystem.getInstance();
