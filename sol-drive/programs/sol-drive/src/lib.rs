use borsh::{BorshSerialize, BorshDeserialize};
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
    program_error::ProgramError,
};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct UserMetadata {
    pub user_solana: Vec<u8>,
    pub did_public_address: Vec<u8>,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct TokenMetadata {
    pub file_id: Vec<u8>,
    pub name: Vec<u8>,
    pub weight: u64,
    pub file_parent_id: Vec<u8>,
    pub cid: Vec<u8>,
    pub typ: Vec<u8>,
    pub from: Vec<u8>,
    pub to: Vec<u8>,
    pub version : Vec<u8>
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum InstructionType {
    UserMetadata(UserMetadata),
    TokenMetadata(TokenMetadata),
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("Entered process_instruction");

    let instruction = InstructionType::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        InstructionType::UserMetadata(metadata) => {
            msg!("Processing UserMetadata");
            msg!("Deserialized metadata: {:?}", metadata);
        },
        InstructionType::TokenMetadata(metadata) => {
            msg!("Processing TokenMetadata");
            msg!("Deserialized metadata: {:?}", metadata);
        },
    }

    Ok(())
}